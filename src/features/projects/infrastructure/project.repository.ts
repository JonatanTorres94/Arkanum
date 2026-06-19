import type { CreateProjectInput, Project } from "@/features/projects/domain/project.types";

export interface ProjectRepository {
  create(input: CreateProjectInput): Promise<{ id: string }>;
  findAll(): Promise<Project[]>;
  findById(id: string): Promise<Project | null>;
  findByClientId(clientId: string): Promise<Project[]>;
}
