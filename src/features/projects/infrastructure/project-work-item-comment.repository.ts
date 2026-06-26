import type { ProjectWorkItemComment, CreateProjectWorkItemCommentInput } from "@/features/projects/domain/project-work-item-comment.types";

export interface ProjectWorkItemCommentRepository {
  findByWorkItemId(workItemId: string): Promise<ProjectWorkItemComment[]>;
  findByWorkItemIdVisibleToSupport(workItemId: string): Promise<ProjectWorkItemComment[]>;
  create(workItemId: string, input: CreateProjectWorkItemCommentInput, createdBy: string | null): Promise<{ id: string }>;
}
