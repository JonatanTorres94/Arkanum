import type { UpdateProjectInput, UpdateProjectResult } from "@/features/projects/domain/project.types";
import type { ProjectRepository } from "@/features/projects/infrastructure/project.repository";

// Argentina never observes DST — offset is always UTC-3.
function todayArgentina(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Argentina/Buenos_Aires",
  }).format(new Date());
}

export async function updateProjectUseCase(
  id: string,
  input: UpdateProjectInput,
  repository: ProjectRepository
): Promise<UpdateProjectResult> {
  // Auto-set startDate when the admin manually moves to in_development and
  // the project has no start date yet. Never overwrites an existing date.
  const effectiveStartDate =
    input.status === "in_development" && !input.startDate
      ? todayArgentina()
      : input.startDate;

  try {
    await repository.update(id, { ...input, startDate: effectiveStartDate });
    return { ok: true };
  } catch {
    return { ok: false, error: "No se pudo actualizar el proyecto." };
  }
}
