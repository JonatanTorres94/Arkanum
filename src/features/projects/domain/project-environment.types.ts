export const ENVIRONMENT_TYPES = ["development", "staging", "production", "demo", "other"] as const;
export type EnvironmentType = (typeof ENVIRONMENT_TYPES)[number];

export const ENVIRONMENT_STATUSES = ["active", "inactive", "degraded"] as const;
export type EnvironmentStatus = (typeof ENVIRONMENT_STATUSES)[number];

export interface ProjectEnvironment {
  id: string;
  projectId: string;
  name: string;
  type: EnvironmentType;
  url: string | null;
  status: EnvironmentStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export type CreateProjectEnvironmentInput = {
  projectId: string;
  name: string;
  type: EnvironmentType;
  url: string | null;
  status: EnvironmentStatus;
  notes: string | null;
};

export type CreateProjectEnvironmentResult =
  | { ok: true; id: string }
  | { ok: false; error: string };
