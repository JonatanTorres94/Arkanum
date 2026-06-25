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
  try {
    const existingProject = await repository.findById(id);
    if (!existingProject) return { ok: false, error: "Proyecto no encontrado." };

    // For in_development: an explicit date from the admin always wins; a null
    // input falls back to the persisted date; if neither exists, auto-set today.
    // For any other status the input date is used as-is (including null).
    const effectiveStartDate =
      input.status === "in_development"
        ? input.startDate ?? existingProject.startDate ?? todayArgentina()
        : input.startDate;

    await repository.update(id, { ...input, startDate: effectiveStartDate });
    return { ok: true };
  } catch {
    return { ok: false, error: "No se pudo actualizar el proyecto." };
  }
}
