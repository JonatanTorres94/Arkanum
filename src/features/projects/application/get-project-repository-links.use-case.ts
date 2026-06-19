import type { ProjectRepositoryLink } from "@/features/projects/domain/project-repository-link.types";
import type { ProjectRepositoryLinkRepository } from "@/features/projects/infrastructure/project-repository-link.repository";

export type GetProjectRepositoryLinksResult =
  | { ok: true; repositories: ProjectRepositoryLink[] }
  | { ok: false; error: string };

export async function getProjectRepositoryLinksUseCase(
  projectId: string,
  repository: ProjectRepositoryLinkRepository
): Promise<GetProjectRepositoryLinksResult> {
  try {
    const repositories = await repository.findByProjectId(projectId);
    return { ok: true, repositories };
  } catch {
    return { ok: false, error: "No se pudieron cargar los repositorios del proyecto." };
  }
}
