import type { Project } from "@/features/projects/domain/project.types";
import type { ProjectRepository } from "@/features/projects/infrastructure/project.repository";

export type GetProjectByIdResult =
  | { ok: true; project: Project }
  | { ok: false; notFound: boolean; error: string };

export async function getProjectByIdUseCase(
  id: string,
  repository: ProjectRepository
): Promise<GetProjectByIdResult> {
  try {
    const project = await repository.findById(id);
    if (!project) return { ok: false, notFound: true, error: "Proyecto no encontrado." };
    return { ok: true, project };
  } catch {
    return { ok: false, notFound: false, error: "No se pudo cargar el proyecto." };
  }
}
