"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getAdminUser } from "@/lib/auth/verify-admin";
import { createSupportTicketUseCase } from "@/features/support/application/create-support-ticket.use-case";
import { getSupportTicketByIdUseCase } from "@/features/support/application/get-support-ticket-by-id.use-case";
import { updateSupportTicketStatusUseCase } from "@/features/support/application/update-support-ticket-status.use-case";
import { updateSupportTicketDetailsUseCase } from "@/features/support/application/update-support-ticket-details.use-case";
import { escalateSupportTicketUseCase } from "@/features/support/application/escalate-support-ticket.use-case";
import { SupabaseSupportTicketRepository } from "@/features/support/infrastructure/supabase-support-ticket.repository";
import {
  TICKET_SOURCES,
  TICKET_CATEGORIES,
  TICKET_STATUSES,
  TICKET_PRIORITIES,
  type TicketSource,
  type TicketCategory,
  type TicketStatus,
  type TicketPriority,
} from "@/features/support/domain/support-ticket.types";
import { getClientByIdUseCase } from "@/features/clients/application/get-client-by-id.use-case";
import { SupabaseClientRepository } from "@/features/clients/infrastructure/supabase-client.repository";
import { getProjectByIdUseCase } from "@/features/projects/application/get-project-by-id.use-case";
import { SupabaseProjectRepository } from "@/features/projects/infrastructure/supabase-project.repository";
import { createProjectWorkItemUseCase } from "@/features/projects/application/create-project-work-item.use-case";
import { getProjectWorkItemByIdUseCase } from "@/features/projects/application/get-project-work-item-by-id.use-case";
import { SupabaseProjectWorkItemRepository } from "@/features/projects/infrastructure/supabase-project-work-item.repository";
import type { WorkItemCategory } from "@/features/projects/domain/project-work-item.types";
import { createSupportTicketNoteUseCase } from "@/features/support/application/create-support-ticket-note.use-case";
import { resolveTicketAfterDevelopmentUseCase } from "@/features/support/application/resolve-ticket-after-development.use-case";
import { returnTicketToDevelopmentUseCase } from "@/features/support/application/return-ticket-to-development.use-case";
import { closeTicketAfterDevelopmentCancellationUseCase } from "@/features/support/application/close-ticket-after-development-cancellation.use-case";
import { resolveSupportInterventionUseCase } from "@/features/support/application/resolve-support-intervention.use-case";
import { SupabaseSupportTicketNoteRepository } from "@/features/support/infrastructure/supabase-support-ticket-note.repository";
import { updateProjectWorkItemStatusUseCase } from "@/features/projects/application/update-project-work-item-status.use-case";
import { synchronizeProjectLifecycleUseCase } from "@/features/projects/application/synchronize-project-lifecycle.use-case";
import { OPEN_WORK_ITEM_STATUSES } from "@/features/projects/domain/project-lifecycle";

// A linked work item that finished or was scrapped no longer blocks support
// resolution — only an actually-open work item should hold a ticket back.
const TERMINAL_WORK_ITEM_STATUSES = ["done", "cancelled"];

const TITLE_MAX_LENGTH = 200;

// Tickets that map cleanly to a dev-work shape keep that shape (bug/improvement/
// task) so the work item reads naturally in the project's backlog. Categories
// without a clean technical equivalent fall back to support_escalation — the
// work item category that exists specifically for support-originated work.
const CATEGORY_TO_WORK_ITEM_CATEGORY: Record<TicketCategory, WorkItemCategory> = {
  bug_report:     "bug",
  incident:       "bug",
  change_request: "improvement",
  configuration:  "task",
  question:       "support_escalation",
  training:       "support_escalation",
  billing:        "support_escalation",
  access_issue:   "support_escalation",
};

function normalize(value: FormDataEntryValue | null): string | null {
  const str = typeof value === "string" ? value.trim() : "";
  return str ? str : null;
}

function isValidEnumValue<T extends string>(options: readonly T[], value: string): value is T {
  return (options as readonly string[]).includes(value);
}

export type CreateSupportTicketFormState = { error: string } | null;

export async function createSupportTicketAction(
  _prev: CreateSupportTicketFormState,
  formData: FormData
): Promise<CreateSupportTicketFormState> {
  const user = await getAdminUser();
  if (!user) return { error: "No autorizado." };

  const clientId = normalize(formData.get("clientId"));
  if (!clientId) return { error: "Seleccioná un cliente." };

  const clientResult = await getClientByIdUseCase(clientId, new SupabaseClientRepository());
  if (!clientResult.ok) return { error: "El cliente seleccionado no existe." };

  const projectId = normalize(formData.get("projectId"));
  if (projectId) {
    const projectResult = await getProjectByIdUseCase(projectId, new SupabaseProjectRepository());
    if (!projectResult.ok) return { error: "El proyecto seleccionado no existe." };
    if (projectResult.project.clientId !== clientId) {
      return { error: "El proyecto seleccionado no pertenece al cliente elegido." };
    }
  }

  const title = normalize(formData.get("title"));
  if (!title) return { error: "El título es obligatorio." };
  if (title.length > TITLE_MAX_LENGTH) return { error: "El título es demasiado largo." };

  const source   = normalize(formData.get("source"))   ?? "manual";
  const category = normalize(formData.get("category")) ?? "question";
  const status   = normalize(formData.get("status"))   ?? "new";
  const priority = normalize(formData.get("priority")) ?? "medium";

  if (!isValidEnumValue(TICKET_SOURCES, source))     return { error: "Fuente inválida." };
  if (!isValidEnumValue(TICKET_CATEGORIES, category)) return { error: "Categoría inválida." };
  if (!isValidEnumValue(TICKET_STATUSES, status))     return { error: "Estado inválido." };
  if (!isValidEnumValue(TICKET_PRIORITIES, priority)) return { error: "Prioridad inválida." };

  const repository = new SupabaseSupportTicketRepository();
  const result = await createSupportTicketUseCase(
    {
      clientId,
      projectId,
      title,
      description: normalize(formData.get("description")),
      notes:       normalize(formData.get("notes")),
      reportedBy:  normalize(formData.get("reportedBy")),
      source:      source as TicketSource,
      category:    category as TicketCategory,
      status:      status as TicketStatus,
      priority:    priority as TicketPriority,
    },
    repository
  );

  if (!result.ok) return { error: result.error };

  redirect(`/admin/support/${result.id}`);
}

export async function updateSupportTicketStatusAction(
  id: string,
  status: string
): Promise<{ error?: string; warning?: string }> {
  const user = await getAdminUser();
  if (!user) return { error: "No autorizado." };

  if (!isValidEnumValue(TICKET_STATUSES, status)) return { error: "Estado inválido." };

  const repository = new SupabaseSupportTicketRepository();
  const ticketResult = await getSupportTicketByIdUseCase(id, repository);
  if (!ticketResult.ok) return { error: "Ticket no encontrado." };

  const { ticket } = ticketResult;

  if (ticket.status === status) return {};

  if (status === "resolved" && ticket.escalatedWorkItemId) {
    const workItemResult = await getProjectWorkItemByIdUseCase(
      ticket.escalatedWorkItemId,
      new SupabaseProjectWorkItemRepository()
    );
    if (workItemResult.ok && !TERMINAL_WORK_ITEM_STATUSES.includes(workItemResult.workItem.status)) {
      return {
        error: "No se puede resolver el ticket mientras el trabajo de desarrollo vinculado siga abierto.",
      };
    }
  }

  const wasResolved = ticket.status === "resolved";

  let resolvedAt = ticket.resolvedAt;
  if (status === "resolved") {
    resolvedAt = new Date().toISOString();
  } else if (wasResolved) {
    resolvedAt = null;
  }

  const outcome = await updateSupportTicketStatusUseCase(
    id,
    { status: status as TicketStatus, resolvedAt },
    repository
  );
  if (!outcome.ok) return { error: outcome.error };

  revalidatePath(`/admin/support/${id}`);
  revalidatePath("/admin/support");
  revalidatePath("/admin/attention");

  // Reopening must never touch the linked work item — development's
  // completed status is historical context, not something support can revive.
  if (wasResolved && status !== "resolved" && ticket.escalatedWorkItemId) {
    const noteOutcome = await createSupportTicketNoteUseCase(
      id,
      "Soporte reabrió el ticket. El work item de desarrollo vinculado permanece cerrado.",
      user.email ?? null,
      new SupabaseSupportTicketNoteRepository()
    );
    if (!noteOutcome.ok) {
      return {
        warning:
          "El ticket se reabrió, pero no se pudo agregar la nota automática de reapertura — " +
          "revisalo manualmente.",
      };
    }
  }

  return {};
}

export async function updateSupportTicketDetailsAction(
  id: string,
  formData: FormData
): Promise<{ error?: string }> {
  const user = await getAdminUser();
  if (!user) return { error: "No autorizado." };

  const repository = new SupabaseSupportTicketRepository();
  const ticketResult = await getSupportTicketByIdUseCase(id, repository);
  if (!ticketResult.ok) return { error: "Ticket no encontrado." };

  const { ticket } = ticketResult;

  const title = normalize(formData.get("title"));
  if (!title) return { error: "El título es obligatorio." };
  if (title.length > TITLE_MAX_LENGTH) return { error: "El título es demasiado largo." };

  const source   = normalize(formData.get("source"))   ?? "manual";
  const category = normalize(formData.get("category")) ?? "question";
  const priority = normalize(formData.get("priority")) ?? "medium";

  if (!isValidEnumValue(TICKET_SOURCES, source))      return { error: "Fuente inválida." };
  if (!isValidEnumValue(TICKET_CATEGORIES, category)) return { error: "Categoría inválida." };
  if (!isValidEnumValue(TICKET_PRIORITIES, priority)) return { error: "Prioridad inválida." };

  // Once escalated, the work item belongs to the original project — the
  // ticket's project association is locked regardless of what the form sent.
  let projectId = ticket.projectId;
  if (!ticket.escalatedWorkItemId) {
    projectId = normalize(formData.get("projectId"));
    if (projectId) {
      const projectResult = await getProjectByIdUseCase(projectId, new SupabaseProjectRepository());
      if (!projectResult.ok) return { error: "El proyecto seleccionado no existe." };
      if (projectResult.project.clientId !== ticket.clientId) {
        return { error: "El proyecto seleccionado no pertenece al cliente del ticket." };
      }
    }
  }

  const outcome = await updateSupportTicketDetailsUseCase(
    id,
    {
      title,
      description: normalize(formData.get("description")),
      projectId,
      reportedBy:  normalize(formData.get("reportedBy")),
      source:      source as TicketSource,
      category:    category as TicketCategory,
      priority:    priority as TicketPriority,
    },
    repository
  );

  if (!outcome.ok) return { error: outcome.error };

  revalidatePath(`/admin/support/${id}`);
  revalidatePath("/admin/support");

  return {};
}

export async function escalateSupportTicketAction(id: string): Promise<{ error?: string; warning?: string }> {
  const user = await getAdminUser();
  if (!user) return { error: "No autorizado." };

  const ticketRepository = new SupabaseSupportTicketRepository();
  const ticketResult = await getSupportTicketByIdUseCase(id, ticketRepository);
  if (!ticketResult.ok) return { error: "Ticket no encontrado." };

  const { ticket } = ticketResult;

  if (ticket.escalatedWorkItemId) {
    return { error: "Este ticket ya fue escalado a desarrollo." };
  }

  if (!ticket.projectId) {
    return { error: "El ticket necesita un proyecto asociado para poder escalarse." };
  }

  const projectResult = await getProjectByIdUseCase(ticket.projectId, new SupabaseProjectRepository());
  if (!projectResult.ok) return { error: "El proyecto asociado ya no existe." };
  if (projectResult.project.clientId !== ticket.clientId) {
    return { error: "El proyecto asociado no pertenece al cliente del ticket." };
  }

  const workItemRepository = new SupabaseProjectWorkItemRepository();

  const workItemResult = await createProjectWorkItemUseCase(
    {
      projectId:   ticket.projectId,
      title:       ticket.title,
      description: ticket.description,
      category:    CATEGORY_TO_WORK_ITEM_CATEGORY[ticket.category],
      status:      "backlog",
      priority:    ticket.priority,
      notes:       `Escalado desde el ticket de soporte "${ticket.title}".`,
    },
    workItemRepository
  );

  if (!workItemResult.ok) return { error: workItemResult.error };

  const escalationOutcome = await escalateSupportTicketUseCase(
    id,
    {
      escalatedWorkItemId: workItemResult.id,
      escalatedAt:         new Date().toISOString(),
      escalatedBy:         user.email ?? null,
    },
    ticketRepository
  );

  if (!escalationOutcome.ok) {
    return {
      error:
        `${escalationOutcome.error} El work item ya se creó en el proyecto, pero el ticket no quedó ` +
        "marcado como escalado — revisalo manualmente.",
    };
  }

  // Lifecycle sync is best effort: work item + ticket are already persisted.
  // A project in testing with a new backlog work item must regress to in_development.
  const syncOutcome = await synchronizeProjectLifecycleUseCase(
    ticket.projectId,
    new SupabaseProjectRepository(),
    workItemRepository
  );

  revalidatePath(`/admin/support/${id}`);
  revalidatePath("/admin/support");
  revalidatePath(`/admin/projects/${ticket.projectId}`);
  revalidatePath(`/admin/projects/${ticket.projectId}/work-items/${workItemResult.id}`);
  if (ticket.clientId) revalidatePath(`/admin/clients/${ticket.clientId}`);

  if (!syncOutcome.ok) {
    return {
      warning:
        "El ticket fue escalado y el work item se creó, pero no se pudo sincronizar el estado del proyecto — revisalo manualmente.",
    };
  }

  return {};
}

const REASON_MAX_LENGTH = 1000;

export async function resolveAfterDevelopmentAction(
  ticketId: string
): Promise<{ error?: string; warning?: string }> {
  const user = await getAdminUser();
  if (!user) return { error: "No autorizado." };

  const ticketRepository = new SupabaseSupportTicketRepository();
  const ticketResult = await getSupportTicketByIdUseCase(ticketId, ticketRepository);
  if (!ticketResult.ok) return { error: "Ticket no encontrado." };

  const { ticket } = ticketResult;

  if (!ticket.escalatedWorkItemId) {
    return { error: "Este ticket no tiene un work item de desarrollo vinculado." };
  }

  const workItemResult = await getProjectWorkItemByIdUseCase(
    ticket.escalatedWorkItemId,
    new SupabaseProjectWorkItemRepository()
  );
  if (!workItemResult.ok) {
    return { error: "El work item vinculado ya no está disponible." };
  }

  if (workItemResult.workItem.status !== "done") {
    return {
      error: "Solo se puede validar cuando el work item de desarrollo está completado.",
    };
  }

  const outcome = await resolveTicketAfterDevelopmentUseCase(
    ticketId,
    user.email ?? null,
    ticketRepository,
    new SupabaseSupportTicketNoteRepository()
  );

  if (!outcome.ok) return { error: outcome.error };

  revalidatePath(`/admin/support/${ticketId}`);
  revalidatePath("/admin/support");
  revalidatePath("/admin/attention");
  revalidatePath(
    `/admin/projects/${workItemResult.workItem.projectId}/work-items/${ticket.escalatedWorkItemId}`
  );
  revalidatePath(`/admin/projects/${workItemResult.workItem.projectId}`);
  if (ticket.clientId) {
    revalidatePath(`/admin/clients/${ticket.clientId}`);
  }

  return outcome.warning ? { warning: outcome.warning } : {};
}

export async function returnToDevelopmentAction(
  ticketId: string,
  reason: string
): Promise<{ error?: string; warning?: string }> {
  const user = await getAdminUser();
  if (!user) return { error: "No autorizado." };

  const trimmedReason = reason.trim();
  if (trimmedReason.length > REASON_MAX_LENGTH) {
    return { error: "El motivo no puede superar los 1000 caracteres." };
  }
  const normalizedReason = trimmedReason || null;

  const ticketRepository = new SupabaseSupportTicketRepository();
  const ticketResult = await getSupportTicketByIdUseCase(ticketId, ticketRepository);
  if (!ticketResult.ok) return { error: "Ticket no encontrado." };

  const { ticket } = ticketResult;

  if (ticket.status === "closed" || ticket.status === "cancelled") {
    return { error: "No se puede devolver a desarrollo un ticket cerrado o cancelado." };
  }

  if (!ticket.escalatedWorkItemId) {
    return { error: "Este ticket no tiene un work item de desarrollo vinculado." };
  }

  const workItemRepository = new SupabaseProjectWorkItemRepository();
  const workItemResult = await getProjectWorkItemByIdUseCase(
    ticket.escalatedWorkItemId,
    workItemRepository
  );
  if (!workItemResult.ok) {
    return { error: "El work item vinculado ya no está disponible." };
  }

  const { workItem } = workItemResult;
  const openStatuses = new Set<string>(OPEN_WORK_ITEM_STATUSES);

  if (openStatuses.has(workItem.status)) {
    return { error: "El work item ya está abierto — no hay nada que devolver." };
  }

  const warnings: string[] = [];

  // Step 1 — update work item to ready (authoritative; ticket unchanged if this fails).
  const workItemOutcome = await updateProjectWorkItemStatusUseCase(
    ticket.escalatedWorkItemId,
    { status: "ready" },
    workItemRepository
  );
  if (!workItemOutcome.ok) return { error: workItemOutcome.error };

  revalidatePath(
    `/admin/projects/${workItem.projectId}/work-items/${ticket.escalatedWorkItemId}`
  );
  revalidatePath(`/admin/projects/${workItem.projectId}`);

  // Step 2 — lifecycle sync (best effort).
  const syncOutcome = await synchronizeProjectLifecycleUseCase(
    workItem.projectId,
    new SupabaseProjectRepository(),
    workItemRepository
  );
  if (!syncOutcome.ok) {
    warnings.push(
      "El work item se devolvió a Desarrollo, pero no se pudo sincronizar el estado del proyecto — revisalo manualmente."
    );
  }

  // Step 3+4 — ticket status + note (partial-failure semantics inside use case).
  const returnOutcome = await returnTicketToDevelopmentUseCase(
    ticketId,
    normalizedReason,
    user.email ?? null,
    ticketRepository,
    new SupabaseSupportTicketNoteRepository()
  );

  // Revalidate all affected routes regardless of ticket-update outcome:
  // work item and project are already persisted at this point.
  revalidatePath(`/admin/support/${ticketId}`);
  revalidatePath("/admin/support");
  revalidatePath("/admin/attention");
  if (ticket.clientId) {
    revalidatePath(`/admin/clients/${ticket.clientId}`);
  }

  if (!returnOutcome.ok) {
    // Work item is ready + lifecycle synced, but ticket status not updated.
    // Return error so the user knows the ticket side is still stale.
    return { error: returnOutcome.error };
  }

  if (returnOutcome.warning) warnings.push(returnOutcome.warning);

  return warnings.length > 0 ? { warning: warnings.join(" ") } : {};
}

export async function closeTicketAfterDevelopmentCancellationAction(
  ticketId: string
): Promise<{ error?: string; warning?: string }> {
  const user = await getAdminUser();
  if (!user) return { error: "No autorizado." };

  const ticketRepository  = new SupabaseSupportTicketRepository();
  const ticketResult = await getSupportTicketByIdUseCase(ticketId, ticketRepository);
  if (!ticketResult.ok) return { error: "Ticket no encontrado." };

  const { ticket } = ticketResult;

  if (!ticket.escalatedWorkItemId) {
    return { error: "Este ticket no tiene un work item de desarrollo vinculado." };
  }

  const workItemResult = await getProjectWorkItemByIdUseCase(
    ticket.escalatedWorkItemId,
    new SupabaseProjectWorkItemRepository()
  );
  if (!workItemResult.ok) {
    return { error: "El work item vinculado ya no está disponible." };
  }

  if (workItemResult.workItem.status !== "cancelled") {
    return { error: "Solo se puede cerrar el ticket cuando el work item de Desarrollo está cancelado." };
  }

  const outcome = await closeTicketAfterDevelopmentCancellationUseCase(
    ticketId,
    user.email ?? null,
    ticketRepository,
    new SupabaseSupportTicketNoteRepository()
  );

  if (!outcome.ok) return { error: outcome.error };

  revalidatePath(`/admin/support/${ticketId}`);
  revalidatePath("/admin/support");
  revalidatePath("/admin/attention");
  revalidatePath(
    `/admin/projects/${workItemResult.workItem.projectId}/work-items/${ticket.escalatedWorkItemId}`
  );
  revalidatePath(`/admin/projects/${workItemResult.workItem.projectId}`);
  if (ticket.clientId) revalidatePath(`/admin/clients/${ticket.clientId}`);

  return outcome.warning ? { warning: outcome.warning } : {};
}

export async function resolveSupportInterventionAction(
  ticketId: string
): Promise<{ error?: string; warning?: string }> {
  const user = await getAdminUser();
  if (!user) return { error: "No autorizado." };

  const ticketRepository   = new SupabaseSupportTicketRepository();
  const workItemRepository = new SupabaseProjectWorkItemRepository();

  const outcome = await resolveSupportInterventionUseCase(
    ticketId,
    user.email ?? null,
    ticketRepository,
    workItemRepository,
    new SupabaseSupportTicketNoteRepository()
  );

  // Re-fetch ticket for revalidation paths — needed for both success and partial failure.
  const ticketResult = await getSupportTicketByIdUseCase(ticketId, ticketRepository);
  const ticket = ticketResult.ok ? ticketResult.ticket : null;

  // Partial failure: ticket updated, WI still awaiting_support. Show current state in UI.
  if (!outcome.ok) {
    if (outcome.partial) {
      revalidatePath(`/admin/support/${ticketId}`);
      revalidatePath("/admin/support");
      revalidatePath("/admin/attention");
      if (ticket?.escalatedWorkItemId && ticket?.projectId) {
        revalidatePath(
          `/admin/projects/${ticket.projectId}/work-items/${ticket.escalatedWorkItemId}`
        );
      }
      if (ticket?.projectId) revalidatePath(`/admin/projects/${ticket.projectId}`);
      if (ticket?.clientId)  revalidatePath(`/admin/clients/${ticket.clientId}`);
    }
    return { error: outcome.error };
  }

  // Lifecycle sync — WI goes to 'ready' (still open), project may remain in_development.
  const warnings: string[] = [];
  if (ticket?.projectId) {
    const syncOutcome = await synchronizeProjectLifecycleUseCase(
      ticket.projectId,
      new SupabaseProjectRepository(),
      workItemRepository
    );
    if (!syncOutcome.ok) {
      warnings.push(
        "La intervención se atendió, pero no se pudo sincronizar el estado del proyecto — revisalo manualmente."
      );
    }
  }

  revalidatePath(`/admin/support/${ticketId}`);
  revalidatePath("/admin/support");
  revalidatePath("/admin/attention");
  if (ticket?.escalatedWorkItemId && ticket?.projectId) {
    revalidatePath(
      `/admin/projects/${ticket.projectId}/work-items/${ticket.escalatedWorkItemId}`
    );
  }
  if (ticket?.projectId) revalidatePath(`/admin/projects/${ticket.projectId}`);
  if (ticket?.clientId)  revalidatePath(`/admin/clients/${ticket.clientId}`);

  if (outcome.warning) warnings.push(outcome.warning);

  return warnings.length > 0 ? { warning: warnings.join(" ") } : {};
}
