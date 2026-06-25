import type { CreateProjectInput, UpdateProjectInput, Project } from "@/features/projects/domain/project.types";

export interface ProjectRepository {
  create(input: CreateProjectInput): Promise<{ id: string }>;
  update(id: string, input: UpdateProjectInput): Promise<void>;
  findAll(): Promise<Project[]>;
  findById(id: string): Promise<Project | null>;
  findByClientId(clientId: string): Promise<Project[]>;
}
