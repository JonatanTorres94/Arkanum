import type { Project } from "@/features/projects/domain/project.types";
import type { ProjectRepository } from "@/features/projects/infrastructure/project.repository";

export type GetProjectsByClientIdResult =
  | { ok: true; projects: Project[] }
  | { ok: false; error: string };

export async function getProjectsByClientIdUseCase(
  clientId: string,
  repository: ProjectRepository
): Promise<GetProjectsByClientIdResult> {
  try {
    const projects = await repository.findByClientId(clientId);
    return { ok: true, projects };
  } catch {
    return { ok: false, error: "No se pudieron cargar los proyectos del cliente." };
  }
}
