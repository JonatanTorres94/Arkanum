export const WORK_ITEM_CATEGORIES = [
  "feature",
  "bug",
  "task",
  "improvement",
  "technical_debt",
  "research",
  "support_escalation",
] as const;
export type WorkItemCategory = (typeof WORK_ITEM_CATEGORIES)[number];

export const WORK_ITEM_STATUSES = [
  "backlog",
  "ready",
  "in_progress",
  "blocked",
  "review",
  "testing",
  "awaiting_support",
  "done",
  "cancelled",
] as const;
export type WorkItemStatus = (typeof WORK_ITEM_STATUSES)[number];

// Statuses available in UI dropdowns.
// 'awaiting_support' is managed exclusively by the intervention flow and must
// not appear as a selectable option in standard create / edit forms.
export const WORK_ITEM_SELECTABLE_STATUSES = WORK_ITEM_STATUSES.filter(
  (s) => s !== "awaiting_support"
) as ReadonlyArray<Exclude<WorkItemStatus, "awaiting_support">>;

export const WORK_ITEM_PRIORITIES = ["low", "medium", "high", "urgent"] as const;
export type WorkItemPriority = (typeof WORK_ITEM_PRIORITIES)[number];

export interface ProjectWorkItem {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  category: WorkItemCategory;
  status: WorkItemStatus;
  priority: WorkItemPriority;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export type CreateProjectWorkItemInput = {
  projectId: string;
  title: string;
  description: string | null;
  category: WorkItemCategory;
  status: WorkItemStatus;
  priority: WorkItemPriority;
  notes: string | null;
};

export type CreateProjectWorkItemResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

export type UpdateProjectWorkItemStatusInput = {
  status: WorkItemStatus;
};

export type UpdateProjectWorkItemStatusResult =
  | { ok: true }
  | { ok: false; error: string };

export type UpdateProjectWorkItemInput = {
  title:       string;
  description: string | null;
  category:    WorkItemCategory;
  status:      WorkItemStatus;
  priority:    WorkItemPriority;
  notes:       string | null;
};

export type UpdateProjectWorkItemResult =
  | { ok: true;  warning?: string }
  | { ok: false; error: string };
