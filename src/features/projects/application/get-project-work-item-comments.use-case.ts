import type { ProjectWorkItemComment } from "@/features/projects/domain/project-work-item-comment.types";
import type { ProjectWorkItemCommentRepository } from "@/features/projects/infrastructure/project-work-item-comment.repository";

export type GetProjectWorkItemCommentsResult =
  | { ok: true; comments: ProjectWorkItemComment[] }
  | { ok: false; error: string };

export async function getProjectWorkItemCommentsUseCase(
  workItemId: string,
  repository: ProjectWorkItemCommentRepository
): Promise<GetProjectWorkItemCommentsResult> {
  try {
    const comments = await repository.findByWorkItemId(workItemId);
    return { ok: true, comments };
  } catch {
    return { ok: false, error: "No se pudieron cargar los comentarios del work item." };
  }
}
