import type { ProjectWorkItem } from "@/features/projects/domain/project-work-item.types";
import type { ProjectWorkItemRepository } from "@/features/projects/infrastructure/project-work-item.repository";

export type GetProjectWorkItemsResult =
  | { ok: true; workItems: ProjectWorkItem[] }
  | { ok: false; error: string };

export async function getProjectWorkItemsUseCase(
  projectId: string,
  repository: ProjectWorkItemRepository
): Promise<GetProjectWorkItemsResult> {
  try {
    const workItems = await repository.findByProjectId(projectId);
    return { ok: true, workItems };
  } catch {
    return { ok: false, error: "No se pudieron cargar los work items del proyecto." };
  }
}
