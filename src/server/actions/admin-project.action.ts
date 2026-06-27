"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getAdminUser } from "@/lib/auth/verify-admin";
import { createProjectUseCase } from "@/features/projects/application/create-project.use-case";
import { updateProjectUseCase } from "@/features/projects/application/update-project.use-case";
import { SupabaseProjectRepository } from "@/features/projects/infrastructure/supabase-project.repository";
import { PROJECT_STATUSES, type ProjectStatus } from "@/features/projects/domain/project.types";
import { getClientByIdUseCase } from "@/features/clients/application/get-client-by-id.use-case";
import { SupabaseClientRepository } from "@/features/clients/infrastructure/supabase-client.repository";
import { getProjectByIdUseCase } from "@/features/projects/application/get-project-by-id.use-case";
import { isValidCalendarDate } from "@/lib/validation/calendar-date";
import { PROTECTED_PROJECT_STATUSES } from "@/features/projects/domain/project-lifecycle";

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

export type UpdateProjectFormState = { error: string } | null;

export async function updateProjectAction(
  projectId: string,
  input: {
    name:        string;
    description: string;
    status:      string;
    startDate:   string;
    targetDate:  string;
    notes:       string;
  }
): Promise<{ error?: string }> {
  const user = await getAdminUser();
  if (!user) return { error: "No autorizado." };

  const repository = new SupabaseProjectRepository();
  const projectResult = await getProjectByIdUseCase(projectId, repository);
  if (!projectResult.ok) return { error: "El proyecto no existe." };

  const name = input.name.trim();
  if (!name) return { error: "El nombre del proyecto es obligatorio." };
  if (name.length > NAME_MAX_LENGTH) return { error: "El nombre es demasiado largo." };

  if (!isValidStatus(input.status)) return { error: "Estado inválido." };

  const startDate  = input.startDate.trim()  || null;
  const targetDate = input.targetDate.trim() || null;

  if (startDate && !isValidCalendarDate(startDate)) {
    return { error: "La fecha de inicio no es válida." };
  }
  if (targetDate && !isValidCalendarDate(targetDate)) {
    return { error: "La fecha objetivo no es válida." };
  }
  if (startDate && targetDate && targetDate < startDate) {
    return { error: "La fecha objetivo no puede ser anterior a la fecha de inicio." };
  }

  const result = await updateProjectUseCase(
    projectId,
    {
      name,
      description: input.description.trim() || null,
      status:      input.status as ProjectStatus,
      startDate,
      targetDate,
      notes:       input.notes.trim() || null,
    },
    repository
  );

  if (!result.ok) return { error: result.error };

  revalidatePath(`/admin/projects/${projectId}`);
  revalidatePath("/admin/projects");
  revalidatePath("/admin/attention");
  return {};
}

// Applies the suggested lifecycle status derived from work-item state.
// This is an explicit admin action — it goes through the same update use case
// and validation as a manual edit. Opening a page never triggers this.
export async function applyLifecycleSuggestionAction(
  projectId: string,
  suggestedStatus: string
): Promise<{ error?: string }> {
  const user = await getAdminUser();
  if (!user) return { error: "No autorizado." };

  if (!isValidStatus(suggestedStatus)) return { error: "Estado sugerido inválido." };

  // Suggestions always advance the project — never to a protected state.
  if (PROTECTED_PROJECT_STATUSES.includes(suggestedStatus as ProjectStatus)) {
    return { error: "No se puede aplicar automáticamente una transición hacia un estado protegido." };
  }

  const repository = new SupabaseProjectRepository();
  const projectResult = await getProjectByIdUseCase(projectId, repository);
  if (!projectResult.ok) return { error: "El proyecto no existe." };

  const { project } = projectResult;

  const result = await updateProjectUseCase(
    projectId,
    {
      name:        project.name,
      description: project.description,
      status:      suggestedStatus as ProjectStatus,
      startDate:   project.startDate,
      targetDate:  project.targetDate,
      notes:       project.notes,
    },
    repository
  );

  if (!result.ok) return { error: result.error };

  revalidatePath(`/admin/projects/${projectId}`);
  revalidatePath("/admin/projects");
  revalidatePath("/admin/attention");
  return {};
}
