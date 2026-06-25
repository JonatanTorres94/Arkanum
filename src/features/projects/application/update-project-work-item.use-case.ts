import type {
  UpdateProjectWorkItemInput,
  UpdateProjectWorkItemResult,
} from "@/features/projects/domain/project-work-item.types";
import type { ProjectWorkItemRepository } from "@/features/projects/infrastructure/project-work-item.repository";

export async function updateProjectWorkItemUseCase(
  id: string,
  projectId: string,
  input: UpdateProjectWorkItemInput,
  repository: ProjectWorkItemRepository
): Promise<UpdateProjectWorkItemResult> {
  try {
    const existing = await repository.findById(id);
    if (!existing) return { ok: false, error: "Work item no encontrado." };
    if (existing.projectId !== projectId) {
      return { ok: false, error: "El work item no pertenece al proyecto indicado." };
    }

    await repository.update(id, input);
    return { ok: true };
  } catch {
    return { ok: false, error: "No se pudo actualizar el work item." };
  }
}
