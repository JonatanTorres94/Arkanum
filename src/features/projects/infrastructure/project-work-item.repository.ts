import type {
  CreateProjectWorkItemInput,
  ProjectWorkItem,
  UpdateProjectWorkItemStatusInput,
} from "@/features/projects/domain/project-work-item.types";

export interface ProjectWorkItemRepository {
  create(input: CreateProjectWorkItemInput): Promise<{ id: string }>;
  findById(id: string): Promise<ProjectWorkItem | null>;
  findByProjectId(projectId: string): Promise<ProjectWorkItem[]>;
  updateStatus(id: string, input: UpdateProjectWorkItemStatusInput): Promise<void>;
}
