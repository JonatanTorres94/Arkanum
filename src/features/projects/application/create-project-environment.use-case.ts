import type {
  CreateProjectEnvironmentInput,
  CreateProjectEnvironmentResult,
} from "@/features/projects/domain/project-environment.types";
import type { ProjectEnvironmentRepository } from "@/features/projects/infrastructure/project-environment.repository";

export async function createProjectEnvironmentUseCase(
  input: CreateProjectEnvironmentInput,
  repository: ProjectEnvironmentRepository
): Promise<CreateProjectEnvironmentResult> {
  try {
    const { id } = await repository.create(input);
    return { ok: true, id };
  } catch {
    return { ok: false, error: "No se pudo crear el entorno." };
  }
}
