import type {
  CreateProjectWorkItemInput,
  CreateProjectWorkItemResult,
} from "@/features/projects/domain/project-work-item.types";
import type { ProjectWorkItemRepository } from "@/features/projects/infrastructure/project-work-item.repository";

export async function createProjectWorkItemUseCase(
  input: CreateProjectWorkItemInput,
  repository: ProjectWorkItemRepository
): Promise<CreateProjectWorkItemResult> {
  try {
    const { id } = await repository.create(input);
    return { ok: true, id };
  } catch {
    return { ok: false, error: "No se pudo crear el work item." };
  }
}
