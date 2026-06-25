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
import { SupabaseSupportTicketRepository } from "@/features/support/infrastructure/supabase-support-ticket.repository";
import { SupabaseSupportTicketNoteRepository } from "@/features/support/infrastructure/supabase-support-ticket-note.repository";
import { synchronizeProjectLifecycleUseCase } from "@/features/projects/application/synchronize-project-lifecycle.use-case";

const TITLE_MAX_LENGTH = 200;

function normalize(value: string): string | null {
  const str = value.trim();
  return str ? str : null;
}

function isValidEnumValue<T extends string>(options: readonly T[], value: string): value is T {
  return (options as readonly string[]).includes(value);
}

// Centralized best-effort side effects for any status transition.
// Revalidates project and support-ticket routes as applicable.
// Returns warning strings for partial failures; never throws.
async function applyStatusSideEffects(opts: {
  workItemId:    string;
  workItemTitle: string;
  projectId:     string;
  previousStatus: WorkItemStatus;
  newStatus:      WorkItemStatus;
  adminEmail:    string | null | undefined;
  workItemRepository: SupabaseProjectWorkItemRepository;
}): Promise<string[]> {
  const {
    workItemId, workItemTitle, projectId,
    previousStatus, newStatus, adminEmail, workItemRepository,
  } = opts;

  const warnings: string[] = [];

  const syncOutcome = await synchronizeProjectLifecycleUseCase(
    projectId,
    new SupabaseProjectRepository(),
    workItemRepository
  );

  revalidatePath(`/admin/projects/${projectId}`);

  if (!syncOutcome.ok) {
    warnings.push(
      "El work item se actualizó, pero no se pudo sincronizar el estado del proyecto — revisalo manualmente."
    );
  }

  // Support note only on first transition to done, never on repeated saves.
  if (newStatus === "done" && previousStatus !== "done") {
    const ticketResult = await getSupportTicketByWorkItemUseCase(
      workItemId,
      new SupabaseSupportTicketRepository()
    );

    if (ticketResult.ok && ticketResult.ticket) {
      const noteOutcome = await createSupportTicketNoteUseCase(
        ticketResult.ticket.id,
        `Desarrollo marcó el work item vinculado ("${workItemTitle}") como completado. ` +
          "El ticket permanece abierto para validación de soporte.",
        adminEmail ?? null,
        new SupabaseSupportTicketNoteRepository()
      );

      revalidatePath(`/admin/support/${ticketResult.ticket.id}`);

      if (!noteOutcome.ok) {
        warnings.push(
          "El work item se marcó como completado, pero no se pudo agregar la nota automática " +
            "en el ticket de soporte vinculado — revisalo manualmente."
        );
      }
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

  const syncOutcome = await synchronizeProjectLifecycleUseCase(
    projectId,
    new SupabaseProjectRepository(),
    repository
  );

  revalidatePath(`/admin/projects/${projectId}`);

  if (!syncOutcome.ok) {
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

  // Load the existing work item before the update to capture previousStatus
  // and to validate project ownership at the action boundary.
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
    projectId,
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

  revalidatePath(`/admin/projects/${projectId}/work-items/${workItemId}`);

  // Skip side effects when status did not change — non-status edits must not
  // trigger lifecycle sync or support notes.
  if (newStatus === previousStatus) return {};

  const warnings = await applyStatusSideEffects({
    workItemId,
    workItemTitle:  title,
    projectId,
    previousStatus,
    newStatus,
    adminEmail:     user.email,
    workItemRepository,
  });

  return warnings.length > 0 ? { warning: warnings.join(" ") } : {};
}
