import type {
  UpdateProjectWorkItemStatusInput,
  UpdateProjectWorkItemStatusResult,
} from "@/features/projects/domain/project-work-item.types";
import type { ProjectWorkItemRepository } from "@/features/projects/infrastructure/project-work-item.repository";

export async function updateProjectWorkItemStatusUseCase(
  id: string,
  input: UpdateProjectWorkItemStatusInput,
  repository: ProjectWorkItemRepository
): Promise<UpdateProjectWorkItemStatusResult> {
  try {
    await repository.updateStatus(id, input);
    return { ok: true };
  } catch {
    return { ok: false, error: "No se pudo actualizar el estado del work item." };
  }
}
