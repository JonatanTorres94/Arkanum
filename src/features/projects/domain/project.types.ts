export const PROJECT_STATUSES = [
  "discovery",
  "planning",
  "in_development",
  "testing",
  "deployed",
  "maintenance",
  "paused",
  "cancelled",
] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export interface Project {
  id: string;
  clientId: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  startDate: string | null;
  targetDate: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export type CreateProjectInput = {
  clientId: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  startDate: string | null;
  targetDate: string | null;
  notes: string | null;
};

export type CreateProjectResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

export type UpdateProjectInput = {
  name:        string;
  description: string | null;
  status:      ProjectStatus;
  startDate:   string | null;
  targetDate:  string | null;
  notes:       string | null;
};

export type UpdateProjectResult =
  | { ok: true }
  | { ok: false; error: string };

export type LifecycleWarning = { message: string };
