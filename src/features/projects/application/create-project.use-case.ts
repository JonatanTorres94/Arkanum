import type { CreateProjectInput, CreateProjectResult } from "@/features/projects/domain/project.types";
import type { ProjectRepository } from "@/features/projects/infrastructure/project.repository";

export async function createProjectUseCase(
  input: CreateProjectInput,
  repository: ProjectRepository
): Promise<CreateProjectResult> {
  try {
    const { id } = await repository.create(input);
    return { ok: true, id };
  } catch {
    return { ok: false, error: "No se pudo crear el proyecto." };
  }
}
