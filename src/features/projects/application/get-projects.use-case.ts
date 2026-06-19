import type { Project } from "@/features/projects/domain/project.types";
import type { ProjectRepository } from "@/features/projects/infrastructure/project.repository";

export type GetProjectsResult =
  | { ok: true; projects: Project[] }
  | { ok: false; error: string };

export async function getProjectsUseCase(
  repository: ProjectRepository
): Promise<GetProjectsResult> {
  try {
    const projects = await repository.findAll();
    return { ok: true, projects };
  } catch {
    return { ok: false, error: "No se pudo cargar el listado de proyectos." };
  }
}
