import type { ProjectWorkItem } from "@/features/projects/domain/project-work-item.types";
import type { ProjectWorkItemRepository } from "@/features/projects/infrastructure/project-work-item.repository";

export type GetProjectWorkItemByIdResult =
  | { ok: true; workItem: ProjectWorkItem }
  | { ok: false; notFound: boolean; error: string };

export async function getProjectWorkItemByIdUseCase(
  id: string,
  repository: ProjectWorkItemRepository
): Promise<GetProjectWorkItemByIdResult> {
  try {
    const workItem = await repository.findById(id);
    if (!workItem) return { ok: false, notFound: true, error: "Work item no encontrado." };
    return { ok: true, workItem };
  } catch {
    return { ok: false, notFound: false, error: "No se pudo cargar el work item." };
  }
}
