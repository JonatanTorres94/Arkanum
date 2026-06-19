import type {
  CreateProjectEnvironmentInput,
  ProjectEnvironment,
} from "@/features/projects/domain/project-environment.types";

export interface ProjectEnvironmentRepository {
  create(input: CreateProjectEnvironmentInput): Promise<{ id: string }>;
  findByProjectId(projectId: string): Promise<ProjectEnvironment[]>;
}
