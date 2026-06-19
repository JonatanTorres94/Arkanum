"use server";

import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/auth/verify-admin";
import { createProjectUseCase } from "@/features/projects/application/create-project.use-case";
import { SupabaseProjectRepository } from "@/features/projects/infrastructure/supabase-project.repository";
import { PROJECT_STATUSES, type ProjectStatus } from "@/features/projects/domain/project.types";
import { getClientByIdUseCase } from "@/features/clients/application/get-client-by-id.use-case";
import { SupabaseClientRepository } from "@/features/clients/infrastructure/supabase-client.repository";
import { isValidCalendarDate } from "@/lib/validation/calendar-date";

const NAME_MAX_LENGTH = 200;

function normalize(value: FormDataEntryValue | null): string | null {
  const str = typeof value === "string" ? value.trim() : "";
  return str ? str : null;
}

function isValidStatus(value: string): value is ProjectStatus {
  return (PROJECT_STATUSES as readonly string[]).includes(value);
}

export type CreateProjectFormState = { error: string } | null;

export async function createProjectAction(
  _prev: CreateProjectFormState,
  formData: FormData
): Promise<CreateProjectFormState> {
  const user = await getAdminUser();
  if (!user) return { error: "No autorizado." };

  const clientId = normalize(formData.get("clientId"));
  if (!clientId) return { error: "Seleccioná un cliente." };

  const clientResult = await getClientByIdUseCase(clientId, new SupabaseClientRepository());
  if (!clientResult.ok) return { error: "El cliente seleccionado no existe." };

  const name = normalize(formData.get("name"));
  if (!name) return { error: "El nombre del proyecto es obligatorio." };
  if (name.length > NAME_MAX_LENGTH) return { error: "El nombre es demasiado largo." };

  const statusRaw = normalize(formData.get("status")) ?? "planning";
  if (!isValidStatus(statusRaw)) return { error: "Estado inválido." };

  const startDate  = normalize(formData.get("startDate"));
  const targetDate = normalize(formData.get("targetDate"));

  if (startDate && !isValidCalendarDate(startDate)) {
    return { error: "La fecha de inicio no es válida." };
  }
  if (targetDate && !isValidCalendarDate(targetDate)) {
    return { error: "La fecha objetivo no es válida." };
  }
  if (startDate && targetDate && targetDate < startDate) {
    return { error: "La fecha objetivo no puede ser anterior a la fecha de inicio." };
  }

  const repository = new SupabaseProjectRepository();
  const result = await createProjectUseCase(
    {
      clientId,
      name,
      description: normalize(formData.get("description")),
      status:      statusRaw,
      startDate,
      targetDate,
      notes:       normalize(formData.get("notes")),
    },
    repository
  );

  if (!result.ok) return { error: result.error };

  redirect(`/admin/projects/${result.id}`);
}
