import type { CreateProjectWorkItemCommentInput } from "@/features/projects/domain/project-work-item-comment.types";
import type { ProjectWorkItemCommentRepository } from "@/features/projects/infrastructure/project-work-item-comment.repository";

export type CreateProjectWorkItemCommentResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

export async function createProjectWorkItemCommentUseCase(
  workItemId: string,
  input: CreateProjectWorkItemCommentInput,
  createdBy: string | null,
  repository: ProjectWorkItemCommentRepository
): Promise<CreateProjectWorkItemCommentResult> {
  try {
    const { id } = await repository.create(workItemId, input, createdBy);
    return { ok: true, id };
  } catch {
    return { ok: false, error: "No se pudo agregar el comentario." };
  }
}
