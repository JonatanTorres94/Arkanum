import type {
  UpdateProjectWorkItemInput,
  UpdateProjectWorkItemResult,
} from "@/features/projects/domain/project-work-item.types";
import type { ProjectWorkItemRepository } from "@/features/projects/infrastructure/project-work-item.repository";

// Existence and project-ownership validation is the caller's responsibility
// (action boundary). This use case only persists the update.
export async function updateProjectWorkItemUseCase(
  id: string,
  input: UpdateProjectWorkItemInput,
  repository: ProjectWorkItemRepository
): Promise<UpdateProjectWorkItemResult> {
  try {
    await repository.update(id, input);
    return { ok: true };
  } catch {
    return { ok: false, error: "No se pudo actualizar el work item." };
  }
}
