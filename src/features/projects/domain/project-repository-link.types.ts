// Named "Link" (not "ProjectRepository") to avoid colliding with the
// ProjectRepository persistence interface in
// infrastructure/project.repository.ts, which manages the Project entity.
export const REPOSITORY_PROVIDERS = ["github", "other"] as const;
export type RepositoryProvider = (typeof REPOSITORY_PROVIDERS)[number];

export interface ProjectRepositoryLink {
  id: string;
  projectId: string;
  provider: RepositoryProvider;
  owner: string | null;
  name: string;
  repoUrl: string;
  defaultBranch: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export type CreateProjectRepositoryLinkInput = {
  projectId: string;
  provider: RepositoryProvider;
  owner: string | null;
  name: string;
  repoUrl: string;
  defaultBranch: string | null;
  notes: string | null;
};

export type CreateProjectRepositoryLinkResult =
  | { ok: true; id: string }
  | { ok: false; error: string };
