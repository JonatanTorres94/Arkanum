import type { Project, ProjectStatus, LifecycleWarning } from "./project.types";
import type { ProjectWorkItem } from "./project-work-item.types";

// ─── Manual transition matrix ─────────────────────────────────────────────────

// Explicit set of allowed target statuses per source status for manual edits.
// Same-status (no-op) updates are always allowed and checked separately.
//
// Constraints:
// - deployed/maintenance → cannot go back to discovery/planning/testing
//   (post-deployment projects don't restart early phases via simple edit)
// - cancelled → can only restart from discovery or planning
const ALLOWED_MANUAL_TRANSITIONS: Record<ProjectStatus, readonly ProjectStatus[]> = {
  discovery:      ["planning", "in_development", "testing", "deployed", "maintenance", "paused", "cancelled"],
  planning:       ["discovery", "in_development", "testing", "deployed", "maintenance", "paused", "cancelled"],
  in_development: ["discovery", "planning", "testing", "deployed", "maintenance", "paused", "cancelled"],
  testing:        ["discovery", "planning", "in_development", "deployed", "maintenance", "paused", "cancelled"],
  deployed:       ["in_development", "maintenance", "paused", "cancelled"],
  maintenance:    ["in_development", "deployed", "paused", "cancelled"],
  paused:         ["discovery", "planning", "in_development", "testing", "deployed", "maintenance", "cancelled"],
  cancelled:      ["discovery", "planning"],
};

export type ProjectStatusTransitionResult =
  | { ok: true }
  | { ok: false; error: string };

export function validateProjectStatusTransition(
  currentStatus: ProjectStatus,
  targetStatus:  ProjectStatus
): ProjectStatusTransitionResult {
  if (currentStatus === targetStatus) return { ok: true };

  if (ALLOWED_MANUAL_TRANSITIONS[currentStatus].includes(targetStatus)) {
    return { ok: true };
  }

  return {
    ok:    false,
    error: `No se puede cambiar el estado de "${currentStatus}" a "${targetStatus}" directamente.`,
  };
}

// Statuses that indicate the work item is still in progress (not terminal).
export const OPEN_WORK_ITEM_STATUSES = [
  "backlog",
  "ready",
  "in_progress",
  "blocked",
  "review",
  "testing",
  "awaiting_support",
] as const;

// Statuses that represent real execution started (past backlog/ready planning).
export const EXECUTION_WI_STATUSES = [
  "in_progress",
  "blocked",
  "review",
  "testing",
  "awaiting_support",
  "done",
] as const;

// Project statuses that cannot be overwritten automatically.
// Transitions into or out of these require an explicit admin action.
export const PROTECTED_PROJECT_STATUSES: readonly ProjectStatus[] = [
  "deployed",
  "maintenance",
  "paused",
  "cancelled",
];

// ─── Legacy warning helper (kept for compatibility with existing page) ─────────

// Pure domain computation — no IO.
export function computeLifecycleWarnings(
  project: Project,
  workItems: ProjectWorkItem[]
): LifecycleWarning[] {
  return assessProjectLifecycle(project, workItems).warnings;
}

// ─── Lifecycle assessment ─────────────────────────────────────────────────────

export type LifecycleReason =
  | "planning_while_execution_exists"
  | "planning_while_testing_exists"
  | "in_development_while_testing_exists"
  | "ahead_of_execution"
  | "completed_with_active_work"
  | "execution_status_missing_start_date"
  | "all_work_items_cancelled";

export type LifecycleSeverity = "info" | "warning";

export interface LifecycleInconsistency {
  reason:          LifecycleReason;
  message:         string;
  suggestedStatus: ProjectStatus | null;
  severity:        LifecycleSeverity;
}

export interface ProjectLifecycleAssessment {
  consistent:       boolean;
  inconsistencies:  LifecycleInconsistency[];
  // Top-level convenience fields from the most severe inconsistency, if any.
  suggestedStatus:  ProjectStatus | null;
  severity:         LifecycleSeverity | null;
  // Flattened warnings for backward-compatible rendering.
  warnings:         LifecycleWarning[];
}

export function assessProjectLifecycle(
  project: Project,
  workItems: ProjectWorkItem[]
): ProjectLifecycleAssessment {
  const inconsistencies: LifecycleInconsistency[] = [];

  if (workItems.length > 0) {
    const executionSet  = new Set<string>(EXECUTION_WI_STATUSES);
    const openSet       = new Set<string>(OPEN_WORK_ITEM_STATUSES);

    const hasExecution  = workItems.some((wi) => executionSet.has(wi.status));
    const hasTesting    = workItems.some((wi) => wi.status === "testing");
    const hasInProgress = workItems.some((wi) => wi.status === "in_progress");
    const hasActive     = workItems.some((wi) => openSet.has(wi.status));
    const allCancelled  = workItems.every((wi) => wi.status === "cancelled");

    // Planning while execution exists.
    if (project.status === "planning" && hasTesting) {
      inconsistencies.push({
        reason:          "planning_while_testing_exists",
        message:         "El proyecto continúa en Planificación, pero ya hay work items en Testing.",
        suggestedStatus: "testing",
        severity:        "warning",
      });
    } else if (project.status === "planning" && hasExecution) {
      inconsistencies.push({
        reason:          "planning_while_execution_exists",
        message:         "El proyecto continúa en Planificación, pero ya existen trabajos en ejecución.",
        suggestedStatus: hasInProgress ? "in_development" : null,
        severity:        "warning",
      });
    }

    // In development while testing exists.
    if (project.status === "in_development" && hasTesting) {
      inconsistencies.push({
        reason:          "in_development_while_testing_exists",
        message:         "El proyecto está En desarrollo, pero ya hay work items en Testing.",
        suggestedStatus: "testing",
        severity:        "warning",
      });
    }

    // Project ahead of execution: testing but all WIs are backlog/ready.
    if (project.status === "testing" && !hasExecution) {
      inconsistencies.push({
        reason:          "ahead_of_execution",
        message:         "El proyecto está en Testing, pero ningún work item está en ejecución real.",
        suggestedStatus: null,
        severity:        "info",
      });
    }

    // Completed with active work.
    if (project.status === "deployed" && hasActive) {
      inconsistencies.push({
        reason:          "completed_with_active_work",
        message:         "El proyecto está Deployado, pero hay work items activos.",
        suggestedStatus: null,
        severity:        "warning",
      });
    }

    // All cancelled.
    if (allCancelled) {
      inconsistencies.push({
        reason:          "all_work_items_cancelled",
        message:         "Todos los work items están cancelados. Revisá el estado del proyecto.",
        suggestedStatus: null,
        severity:        "warning",
      });
    }
  }

  // Execution status with missing start date.
  const needsStartDate =
    project.status === "in_development" || project.status === "testing";
  if (needsStartDate && !project.startDate) {
    inconsistencies.push({
      reason:          "execution_status_missing_start_date",
      message:         "El proyecto está en ejecución pero no tiene fecha de inicio registrada.",
      suggestedStatus: null,
      severity:        "info",
    });
  }

  const consistent = inconsistencies.length === 0;
  const topInconsistency = inconsistencies.find((i) => i.severity === "warning") ?? inconsistencies[0] ?? null;

  return {
    consistent,
    inconsistencies,
    suggestedStatus: topInconsistency?.suggestedStatus ?? null,
    severity:        topInconsistency?.severity ?? null,
    warnings:        inconsistencies.map((i) => ({ message: i.message })),
  };
}
