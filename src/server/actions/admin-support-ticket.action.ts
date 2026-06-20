"use server";

import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/auth/verify-admin";
import { createSupportTicketUseCase } from "@/features/support/application/create-support-ticket.use-case";
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

const TITLE_MAX_LENGTH = 200;

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
