"use server";

import { revalidatePath } from "next/cache";
import { getAdminUser } from "@/lib/auth/verify-admin";
import { getProjectByIdUseCase } from "@/features/projects/application/get-project-by-id.use-case";
import { SupabaseProjectRepository } from "@/features/projects/infrastructure/supabase-project.repository";
import { createProjectWorkItemUseCase } from "@/features/projects/application/create-project-work-item.use-case";
import { getProjectWorkItemByIdUseCase } from "@/features/projects/application/get-project-work-item-by-id.use-case";
import { updateProjectWorkItemStatusUseCase } from "@/features/projects/application/update-project-work-item-status.use-case";
import { updateProjectWorkItemUseCase } from "@/features/projects/application/update-project-work-item.use-case";
import { SupabaseProjectWorkItemRepository } from "@/features/projects/infrastructure/supabase-project-work-item.repository";
import {
  WORK_ITEM_CATEGORIES,
  WORK_ITEM_STATUSES,
  WORK_ITEM_PRIORITIES,
  type WorkItemCategory,
  type WorkItemStatus,
  type WorkItemPriority,
} from "@/features/projects/domain/project-work-item.types";
import { getSupportTicketByWorkItemUseCase } from "@/features/support/application/get-support-ticket-by-work-item.use-case";
import { createSupportTicketNoteUseCase } from "@/features/support/application/create-support-ticket-note.use-case";
import { requestSupportInterventionUseCase } from "@/features/projects/application/request-support-intervention.use-case";
import { SupabaseSupportTicketRepository } from "@/features/support/infrastructure/supabase-support-ticket.repository";
import { SupabaseSupportTicketNoteRepository } from "@/features/support/infrastructure/supabase-support-ticket-note.repository";
import { SupabaseProjectWorkItemCommentRepository } from "@/features/projects/infrastructure/supabase-project-work-item-comment.repository";
import { synchronizeProjectLifecycleUseCase } from "@/features/projects/application/synchronize-project-lifecycle.use-case";
import { reopenProjectForDevelopmentUseCase } from "@/features/projects/application/reopen-project-for-development.use-case";
import { isNewWorkItemReopenTrigger } from "@/features/projects/domain/project-lifecycle";
import type { SupportTicket } from "@/features/support/domain/support-ticket.types";
import { COMMENT_MAX_LENGTH } from "@/features/projects/domain/project-work-item-comment.types";

const TITLE_MAX_LENGTH = 200;

function normalize(value: string): string | null {
  const str = value.trim();
  return str ? str : null;
}

function isValidEnumValue<T extends string>(options: readonly T[], value: string): value is T {
  return (options as readonly string[]).includes(value);
}

function revalidateSupportTicketRoutes(ticket: SupportTicket): void {
  revalidatePath(`/admin/support/${ticket.id}`);
  revalidatePath("/admin/support");
  revalidatePath("/admin/attention");
  if (ticket.clientId) revalidatePath(`/admin/clients/${ticket.clientId}`);
}

// Centralized best-effort side effects for any status transition.
//
// When `preloadedTicket` is provided the function skips the ticket fetch and
// the support-route revalidation (the caller already did both). This prevents a
// double DB read when transitioning to "done" inside updateProjectWorkItemAction,
// which fetches the ticket upfront so it can revalidate support routes even when
// the status has not changed.
//
// When `preloadedTicket` is NOT provided (e.g. inline-status path), this
// function fetches the ticket itself and revalidates support routes.
async function applyStatusSideEffects(opts: {
  workItemId:      string;
  workItemTitle:   string;
  projectId:       string;
  previousStatus:  WorkItemStatus;
  newStatus:       WorkItemStatus;
  adminEmail:      string | null | undefined;
  workItemRepository: SupabaseProjectWorkItemRepository;
  preloadedTicket?: SupportTicket | null;
}): Promise<string[]> {
  const {
    workItemId, workItemTitle, projectId,
    previousStatus, newStatus, adminEmail, workItemRepository,
    preloadedTicket,
  } = opts;

  const warnings: string[] = [];

  const syncOutcome = await synchronizeProjectLifecycleUseCase(
    projectId,
    new SupabaseProjectRepository(),
    workItemRepository
  );

  if (!syncOutcome.ok) {
    warnings.push(
      "El work item se actualizó, pero no se pudo sincronizar el estado del proyecto — revisalo manualmente."
    );
  }

  // Fetch ticket when not preloaded (inline-status path).
  // When preloaded, caller already revalidated support routes.
  let ticket: SupportTicket | null = null;
  const callerHandledSupport = preloadedTicket !== undefined;

  if (!callerHandledSupport) {
    const ticketResult = await getSupportTicketByWorkItemUseCase(
      workItemId,
      new SupabaseSupportTicketRepository()
    );
    if (ticketResult.ok && ticketResult.ticket) {
      ticket = ticketResult.ticket;
      revalidateSupportTicketRoutes(ticket);
    }
  } else {
    ticket = preloadedTicket;
  }

  // Support note only on first transition to done, never on repeated saves.
  if (newStatus === "done" && previousStatus !== "done" && ticket) {
    const noteOutcome = await createSupportTicketNoteUseCase(
      ticket.id,
      `Desarrollo marcó el work item vinculado ("${workItemTitle}") como completado. ` +
        "El ticket permanece abierto para validación de soporte.",
      adminEmail ?? null,
      new SupabaseSupportTicketNoteRepository()
    );

    if (!noteOutcome.ok) {
      warnings.push(
        "El work item se marcó como completado, pero no se pudo agregar la nota automática " +
          "en el ticket de soporte vinculado — revisalo manualmente."
      );
    }
  }

  return warnings;
}

export async function createProjectWorkItemAction(
  projectId: string,
  input: {
    title: string;
    description: string;
    category: string;
    status: string;
    priority: string;
    notes: string;
  }
): Promise<{ error?: string; warning?: string }> {
  const user = await getAdminUser();
  if (!user) return { error: "No autorizado." };

  const projectResult = await getProjectByIdUseCase(projectId, new SupabaseProjectRepository());
  if (!projectResult.ok) return { error: "El proyecto no existe." };

  const title = normalize(input.title);
  if (!title) return { error: "El título es obligatorio." };
  if (title.length > TITLE_MAX_LENGTH) return { error: "El título es demasiado largo." };

  if (!isValidEnumValue(WORK_ITEM_CATEGORIES, input.category)) {
    return { error: "Categoría inválida." };
  }
  if (!isValidEnumValue(WORK_ITEM_STATUSES, input.status)) {
    return { error: "Estado inválido." };
  }
  if (!isValidEnumValue(WORK_ITEM_PRIORITIES, input.priority)) {
    return { error: "Prioridad inválida." };
  }

  const repository = new SupabaseProjectWorkItemRepository();
  const result = await createProjectWorkItemUseCase(
    {
      projectId,
      title,
      description: normalize(input.description),
      category:    input.category as WorkItemCategory,
      status:      input.status as WorkItemStatus,
      priority:    input.priority as WorkItemPriority,
      notes:       normalize(input.notes),
    },
    repository
  );

  if (!result.ok) return { error: result.error };

  // Any new development work (backlog/ready/in_progress/blocked/review) is an
  // explicit rework signal — it must reopen the project even if it was in testing.
  // The policy is centralized in isNewWorkItemReopenTrigger so it is not
  // duplicated as ad-hoc arrays across call sites.
  // terminal and testing statuses use ordinary sync (which only advances).
  const isReopenTrigger = isNewWorkItemReopenTrigger(input.status as WorkItemStatus);

  const lifecycleOutcome = isReopenTrigger
    ? await reopenProjectForDevelopmentUseCase(
        projectId,
        new SupabaseProjectRepository(),
        "new_active_work_item"
      )
    : await synchronizeProjectLifecycleUseCase(
        projectId,
        new SupabaseProjectRepository(),
        repository
      );

  revalidatePath(`/admin/projects/${projectId}`);
  revalidatePath("/admin/projects");
  revalidatePath("/admin/attention");

  if (!lifecycleOutcome.ok) {
    return {
      warning:
        "El work item se creó, pero no se pudo sincronizar el estado del proyecto — revisalo manualmente.",
    };
  }

  return {};
}

export async function updateProjectWorkItemStatusAction(
  workItemId: string,
  status: string
): Promise<{ error?: string; warning?: string }> {
  const user = await getAdminUser();
  if (!user) return { error: "No autorizado." };

  if (!isValidEnumValue(WORK_ITEM_STATUSES, status)) return { error: "Estado inválido." };

  if (status === "awaiting_support") {
    return { error: "Usá el flujo de intervención de Soporte para establecer este estado." };
  }

  const workItemRepository = new SupabaseProjectWorkItemRepository();
  const workItemResult = await getProjectWorkItemByIdUseCase(workItemId, workItemRepository);
  if (!workItemResult.ok) return { error: "Work item no encontrado." };

  const { workItem } = workItemResult;

  if (workItem.status === status) return {};

  const outcome = await updateProjectWorkItemStatusUseCase(
    workItemId,
    { status: status as WorkItemStatus },
    workItemRepository
  );
  if (!outcome.ok) return { error: outcome.error };

  revalidatePath(`/admin/projects/${workItem.projectId}`);
  revalidatePath(`/admin/projects/${workItem.projectId}/work-items/${workItemId}`);

  // No preloadedTicket: applyStatusSideEffects fetches the ticket itself and
  // revalidates support routes for any status transition.
  const warnings = await applyStatusSideEffects({
    workItemId,
    workItemTitle:  workItem.title,
    projectId:      workItem.projectId,
    previousStatus: workItem.status,
    newStatus:      status as WorkItemStatus,
    adminEmail:     user.email,
    workItemRepository,
  });

  return warnings.length > 0 ? { warning: warnings.join(" ") } : {};
}

export async function updateProjectWorkItemAction(
  projectId: string,
  workItemId: string,
  input: {
    title:       string;
    description: string;
    category:    string;
    status:      string;
    priority:    string;
    notes:       string;
  }
): Promise<{ error?: string; warning?: string }> {
  const user = await getAdminUser();
  if (!user) return { error: "No autorizado." };

  const title = normalize(input.title);
  if (!title) return { error: "El título es obligatorio." };
  if (title.length > TITLE_MAX_LENGTH) return { error: "El título es demasiado largo." };

  if (!isValidEnumValue(WORK_ITEM_CATEGORIES, input.category)) {
    return { error: "Categoría inválida." };
  }
  if (!isValidEnumValue(WORK_ITEM_STATUSES, input.status)) {
    return { error: "Estado inválido." };
  }
  if (!isValidEnumValue(WORK_ITEM_PRIORITIES, input.priority)) {
    return { error: "Prioridad inválida." };
  }

  if (input.status === "awaiting_support") {
    return { error: "Usá el flujo de intervención de Soporte para establecer este estado." };
  }

  // Single read before the update: captures previousStatus and validates project
  // ownership at the action boundary. The use case trusts this validation and
  // does not repeat the findById, so there is only one DB read of the work item.
  const workItemRepository = new SupabaseProjectWorkItemRepository();
  const existingResult = await getProjectWorkItemByIdUseCase(workItemId, workItemRepository);
  if (!existingResult.ok) return { error: "Work item no encontrado." };

  const { workItem: existing } = existingResult;
  if (existing.projectId !== projectId) {
    return { error: "El work item no pertenece al proyecto indicado." };
  }

  const newStatus      = input.status as WorkItemStatus;
  const previousStatus = existing.status;

  const outcome = await updateProjectWorkItemUseCase(
    workItemId,
    {
      title,
      description: normalize(input.description),
      category:    input.category as WorkItemCategory,
      status:      newStatus,
      priority:    input.priority as WorkItemPriority,
      notes:       normalize(input.notes),
    },
    workItemRepository
  );

  if (!outcome.ok) return { error: outcome.error };

  // Always revalidate detail + parent project, regardless of which fields changed.
  revalidatePath(`/admin/projects/${projectId}/work-items/${workItemId}`);
  revalidatePath(`/admin/projects/${projectId}`);

  // Fetch the linked support ticket once. Revalidate its routes for any edit
  // (not only status changes) so the handoff panel always shows fresh data.
  const warnings: string[] = [];
  const ticketResult = await getSupportTicketByWorkItemUseCase(
    workItemId,
    new SupabaseSupportTicketRepository()
  );

  let linkedTicket: SupportTicket | null = null;
  if (!ticketResult.ok) {
    warnings.push(
      "El work item se actualizó, pero no se pudo sincronizar la vista del ticket de soporte vinculado."
    );
  } else if (ticketResult.ticket) {
    linkedTicket = ticketResult.ticket;
    revalidateSupportTicketRoutes(linkedTicket);
  }

  // Skip lifecycle sync and support notes when status did not change.
  if (newStatus === previousStatus) {
    return warnings.length > 0 ? { warning: warnings.join(" ") } : {};
  }

  // Pass the pre-fetched ticket to avoid a second DB read in applyStatusSideEffects.
  const sideEffectWarnings = await applyStatusSideEffects({
    workItemId,
    workItemTitle:  title,
    projectId,
    previousStatus,
    newStatus,
    adminEmail:     user.email,
    workItemRepository,
    preloadedTicket: linkedTicket,
  });

  return [...warnings, ...sideEffectWarnings].length > 0
    ? { warning: [...warnings, ...sideEffectWarnings].join(" ") }
    : {};
}

export async function requestSupportInterventionAction(
  projectId: string,
  workItemId: string,
  comment: string
): Promise<{ error?: string; warning?: string }> {
  const user = await getAdminUser();
  if (!user) return { error: "No autorizado." };

  // Boundary validation: content must not be empty at the action layer.
  const trimmedComment = comment.trim();
  if (!trimmedComment) return { error: "El comentario de intervención es obligatorio." };
  if (trimmedComment.length > COMMENT_MAX_LENGTH) {
    return { error: `El comentario no puede superar los ${COMMENT_MAX_LENGTH} caracteres.` };
  }

  // Validate work item ownership.
  const workItemRepository = new SupabaseProjectWorkItemRepository();
  const workItemResult = await getProjectWorkItemByIdUseCase(workItemId, workItemRepository);
  if (!workItemResult.ok) return { error: "Work item no encontrado." };
  if (workItemResult.workItem.projectId !== projectId) {
    return { error: "El work item no pertenece al proyecto indicado." };
  }

  // Validate that a support ticket is linked (intervention only makes sense in that context).
  const ticketResult = await getSupportTicketByWorkItemUseCase(
    workItemId,
    new SupabaseSupportTicketRepository()
  );
  if (!ticketResult.ok || !ticketResult.ticket) {
    return { error: "Este work item no tiene un ticket de soporte vinculado." };
  }

  const { ticket } = ticketResult;

  if (ticket.status === "closed" || ticket.status === "cancelled" || ticket.status === "resolved") {
    return { error: "No se puede solicitar intervención en un ticket cerrado, cancelado o resuelto." };
  }

  const outcome = await requestSupportInterventionUseCase(
    workItemId,
    ticket.id,
    trimmedComment,
    user.email ?? null,
    new SupabaseProjectWorkItemCommentRepository(),
    workItemRepository,
    new SupabaseSupportTicketRepository(),
    new SupabaseSupportTicketNoteRepository()
  );

  // Partial failure: comment + WI updated, ticket not marked. Revalidate so UI shows partial state.
  if (!outcome.ok) {
    if (outcome.partial) {
      revalidatePath(`/admin/projects/${projectId}/work-items/${workItemId}`);
      revalidatePath(`/admin/projects/${projectId}`);
      revalidatePath(`/admin/support/${ticket.id}`);
      revalidatePath("/admin/support");
      revalidatePath("/admin/attention");
      if (ticket.clientId) revalidatePath(`/admin/clients/${ticket.clientId}`);
    }
    return { error: outcome.error };
  }

  // Support intervention is an explicit rework trigger — use the dedicated reopen
  // use case so that a project in testing is correctly reopened to in_development.
  // Ordinary lifecycle sync would not regress from testing, which is correct for
  // routine status churn, but wrong here.
  const reopenOutcome = await reopenProjectForDevelopmentUseCase(
    projectId,
    new SupabaseProjectRepository(),
    "support_intervention"
  );

  // Revalidate all affected routes.
  revalidatePath(`/admin/projects/${projectId}/work-items/${workItemId}`);
  revalidatePath(`/admin/projects/${projectId}`);
  revalidatePath("/admin/projects");
  revalidatePath(`/admin/support/${ticket.id}`);
  revalidatePath("/admin/support");
  revalidatePath("/admin/attention");
  if (ticket.clientId) revalidatePath(`/admin/clients/${ticket.clientId}`);

  const warnings: string[] = [];
  if (outcome.warning) warnings.push(outcome.warning);
  if (!reopenOutcome.ok) {
    warnings.push(
      "El work item se actualizó, pero no se pudo reabrir el proyecto para desarrollo — revisalo manualmente."
    );
  }

  return warnings.length > 0 ? { warning: warnings.join(" ") } : {};
}
