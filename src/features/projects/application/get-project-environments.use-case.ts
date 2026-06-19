import type { ProjectEnvironment } from "@/features/projects/domain/project-environment.types";
import type { ProjectEnvironmentRepository } from "@/features/projects/infrastructure/project-environment.repository";

export type GetProjectEnvironmentsResult =
  | { ok: true; environments: ProjectEnvironment[] }
  | { ok: false; error: string };

export async function getProjectEnvironmentsUseCase(
  projectId: string,
  repository: ProjectEnvironmentRepository
): Promise<GetProjectEnvironmentsResult> {
  try {
    const environments = await repository.findByProjectId(projectId);
    return { ok: true, environments };
  } catch {
    return { ok: false, error: "No se pudieron cargar los entornos del proyecto." };
  }
}
