import type {
  CreateProjectWorkItemInput,
  ProjectWorkItem,
} from "@/features/projects/domain/project-work-item.types";

export interface ProjectWorkItemRepository {
  create(input: CreateProjectWorkItemInput): Promise<{ id: string }>;
  findByProjectId(projectId: string): Promise<ProjectWorkItem[]>;
}
