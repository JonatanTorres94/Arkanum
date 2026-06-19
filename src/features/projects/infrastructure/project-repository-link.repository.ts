import type {
  CreateProjectRepositoryLinkInput,
  ProjectRepositoryLink,
} from "@/features/projects/domain/project-repository-link.types";

export interface ProjectRepositoryLinkRepository {
  create(input: CreateProjectRepositoryLinkInput): Promise<{ id: string }>;
  findByProjectId(projectId: string): Promise<ProjectRepositoryLink[]>;
}
