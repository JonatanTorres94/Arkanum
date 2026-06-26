import type { ProjectWorkItemComment } from "@/features/projects/domain/project-work-item-comment.types";
import type { ProjectWorkItemCommentRepository } from "@/features/projects/infrastructure/project-work-item-comment.repository";

export type GetProjectWorkItemCommentsSupportVisibleResult =
  | { ok: true; comments: ProjectWorkItemComment[] }
  | { ok: false; error: string };

export async function getProjectWorkItemCommentsSupportVisibleUseCase(
  workItemId: string,
  repository: ProjectWorkItemCommentRepository
): Promise<GetProjectWorkItemCommentsSupportVisibleResult> {
  try {
    const comments = await repository.findByWorkItemIdVisibleToSupport(workItemId);
    return { ok: true, comments };
  } catch {
    return { ok: false, error: "No se pudieron cargar los comentarios de desarrollo." };
  }
}
