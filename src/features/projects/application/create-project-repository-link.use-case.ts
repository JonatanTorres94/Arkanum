import type {
  CreateProjectRepositoryLinkInput,
  CreateProjectRepositoryLinkResult,
} from "@/features/projects/domain/project-repository-link.types";
import type { ProjectRepositoryLinkRepository } from "@/features/projects/infrastructure/project-repository-link.repository";

export async function createProjectRepositoryLinkUseCase(
  input: CreateProjectRepositoryLinkInput,
  repository: ProjectRepositoryLinkRepository
): Promise<CreateProjectRepositoryLinkResult> {
  try {
    const { id } = await repository.create(input);
    return { ok: true, id };
  } catch {
    return { ok: false, error: "No se pudo vincular el repositorio." };
  }
}
