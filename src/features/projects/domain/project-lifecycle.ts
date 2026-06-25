import type { Project, LifecycleWarning } from "./project.types";
import type { ProjectWorkItem } from "./project-work-item.types";

// Statuses that indicate the work item is still in progress (not terminal).
export const OPEN_WORK_ITEM_STATUSES = [
  "backlog",
  "ready",
  "in_progress",
  "blocked",
  "review",
  "testing",
] as const;

// Pure domain computation — no IO. Called from the detail page (server) and
// from synchronizeProjectLifecycleUseCase with already-loaded data.
export function computeLifecycleWarnings(
  project: Project,
  workItems: ProjectWorkItem[]
): LifecycleWarning[] {
  if (workItems.length === 0) return [];

  const warnings: LifecycleWarning[] = [];

  if (project.status === "planning") {
    const hasStartedWork = workItems.some(
      (wi) => wi.status === "in_progress" || wi.status === "done" || wi.status === "cancelled"
    );
    if (hasStartedWork) {
      warnings.push({
        message:
          "El proyecto sigue en Planificación aunque ya existe trabajo iniciado o completado.",
      });
    }
  }

  const allCancelled = workItems.every((wi) => wi.status === "cancelled");
  if (allCancelled) {
    warnings.push({
      message: "Todos los work items están cancelados. Revisá el estado del proyecto.",
    });
  }

  return warnings;
}
