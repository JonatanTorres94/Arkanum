import type { CreateProjectWorkItemCommentInput } from "@/features/projects/domain/project-work-item-comment.types";
import type { ProjectWorkItemCommentRepository } from "@/features/projects/infrastructure/project-work-item-comment.repository";
import { COMMENT_MAX_LENGTH } from "@/features/projects/domain/project-work-item-comment.types";

export type CreateProjectWorkItemCommentResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

export async function createProjectWorkItemCommentUseCase(
  workItemId: string,
  input: CreateProjectWorkItemCommentInput,
  createdBy: string | null,
  repository: ProjectWorkItemCommentRepository
): Promise<CreateProjectWorkItemCommentResult> {
  if (!workItemId.trim()) {
    return { ok: false, error: "Work item inválido." };
  }

  const content = input.content.trim();

  if (!content) {
    return { ok: false, error: "El comentario no puede estar vacío." };
  }

  if (content.length > COMMENT_MAX_LENGTH) {
    return { ok: false, error: `El comentario no puede superar los ${COMMENT_MAX_LENGTH} caracteres.` };
  }

  try {
    const { id } = await repository.create(workItemId, { ...input, content }, createdBy);
    return { ok: true, id };
  } catch {
    return { ok: false, error: "No se pudo agregar el comentario." };
  }
}
