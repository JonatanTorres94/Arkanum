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
  const existingProject = await repository.findById(id);
  if (!existingProject) return { ok: false, error: "Proyecto no encontrado." };

  let effectiveStartDate = input.startDate;

  if (input.status === "in_development") {
    if (existingProject.startDate) {
      // The persisted date is authoritative — a null payload cannot wipe it.
      effectiveStartDate = existingProject.startDate;
    } else if (!input.startDate) {
      // No persisted date, input is empty → auto-set to today.
      effectiveStartDate = todayArgentina();
    }
  }

  try {
    await repository.update(id, { ...input, startDate: effectiveStartDate });
    return { ok: true };
  } catch {
    return { ok: false, error: "No se pudo actualizar el proyecto." };
  }
}
