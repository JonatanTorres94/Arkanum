"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getAdminUser } from "@/lib/auth/verify-admin";
import { createSupportTicketUseCase } from "@/features/support/application/create-support-ticket.use-case";
import { getSupportTicketByIdUseCase } from "@/features/support/application/get-support-ticket-by-id.use-case";
import { updateSupportTicketStatusUseCase } from "@/features/support/application/update-support-ticket-status.use-case";
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
import { SupabaseProjectWorkItemRepository } from "@/features/projects/infrastructure/supabase-project-work-item.repository";
import type { WorkItemCategory } from "@/features/projects/domain/project-work-item.types";

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
): Promise<{ error?: string }> {
  const user = await getAdminUser();
  if (!user) return { error: "No autorizado." };

  if (!isValidEnumValue(TICKET_STATUSES, status)) return { error: "Estado inválido." };

  const repository = new SupabaseSupportTicketRepository();
  const ticketResult = await getSupportTicketByIdUseCase(id, repository);
  if (!ticketResult.ok) return { error: "Ticket no encontrado." };

  const { ticket } = ticketResult;

  if (ticket.status === status) return {};

  let resolvedAt = ticket.resolvedAt;
  if (status === "resolved") {
    resolvedAt = new Date().toISOString();
  } else if (ticket.status === "resolved") {
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

  return {};
}

export async function escalateSupportTicketAction(id: string): Promise<{ error?: string }> {
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
    new SupabaseProjectWorkItemRepository()
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

  revalidatePath(`/admin/support/${id}`);
  revalidatePath(`/admin/projects/${ticket.projectId}`);
  revalidatePath("/admin/support");

  return {};
}
