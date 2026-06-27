import type { ProjectStatus } from "@/features/projects/domain/project.types";
import { OPEN_WORK_ITEM_STATUSES } from "@/features/projects/domain/project-lifecycle";
import type { ProjectRepository } from "@/features/projects/infrastructure/project.repository";
import type { ProjectWorkItemRepository } from "@/features/projects/infrastructure/project-work-item.repository";

function todayArgentina(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Argentina/Buenos_Aires",
  }).format(new Date());
}

// Reasons that carry explicit rework or activation intent. Only these may
// regress a project from testing/deployed/maintenance → in_development, or
// advance planning → in_development without a concrete in_progress WI.
const REWORK_REASONS = new Set([
  "new_work_item",
  "support_ticket_escalated",
  "support_intervention",
]);

// Statuses eligible for activation/reopening to in_development by a rework reason.
// in_development is absent — it is already the target.
// paused/cancelled/discovery are absent — they are never auto-mutated.
const REWORK_ELIGIBLE = new Set<ProjectStatus>([
  "planning",
  "testing",
  "deployed",
  "maintenance",
]);

// Statuses that are never auto-mutated regardless of reason.
const NO_AUTO_MUTATION = new Set<ProjectStatus>(["paused", "cancelled", "discovery"]);

// Open WI statuses — includes backlog/ready so planned-but-unstarted work blocks Rule 3.
const OPEN_WI_SET = new Set<string>(OPEN_WORK_ITEM_STATUSES);

export type ReconcileReason =
  | "new_work_item"
  | "support_ticket_escalated"
  | "support_intervention"
  | "work_item_status_changed"
  | "support_ticket_resolved"
  | "support_ticket_closed"
  | "support_ticket_cancelled";

export type ReconcileLifecycleResult =
  | { ok: true; changed: boolean }
  | { ok: false; error: string };

export async function reconcileProjectLifecycleAfterOperationalChange(
  projectId: string,
  projectRepository: ProjectRepository,
  workItemRepository: ProjectWorkItemRepository,
  reason: ReconcileReason
): Promise<ReconcileLifecycleResult> {
  try {
    const project = await projectRepository.findById(projectId);
    if (!project) return { ok: false, error: "Proyecto no encontrado." };

    if (NO_AUTO_MUTATION.has(project.status)) return { ok: true, changed: false };

    const workItems = await workItemRepository.findByProjectId(projectId);

    const hasInProgress = workItems.some((wi) => wi.status === "in_progress");
    const hasWITesting  = workItems.some((wi) => wi.status === "testing");
    const hasOpen       = workItems.some((wi) => OPEN_WI_SET.has(wi.status));
    const hasDone       = workItems.some((wi) => wi.status === "done");

    let newStatus:    ProjectStatus = project.status;
    let newStartDate: string | null = project.startDate;

    // Reopen/activate: explicit rework reasons advance eligible statuses to in_development.
    // This is the sole mechanism that allows testing/deployed/maintenance → in_development.
    if (REWORK_REASONS.has(reason) && REWORK_ELIGIBLE.has(project.status)) {
      newStatus = "in_development";
      if (project.status === "planning" && !newStartDate) {
        newStartDate = todayArgentina();
      }
    }

    // Rule 1: planning → in_development when any WI is in_progress.
    if (newStatus === "planning" && hasInProgress) {
      newStatus = "in_development";
      if (!newStartDate) newStartDate = todayArgentina();
    }

    // Rule 2: planning/in_development → testing when any WI is in testing.
    // Direct planning → testing jump (bypassing in_development) is allowed.
    if ((newStatus === "planning" || newStatus === "in_development") && hasWITesting) {
      newStatus = "testing";
      if (project.status === "planning" && !newStartDate) newStartDate = todayArgentina();
    }

    // Rule 3: in_development + no open WIs (backlog counts as open) + at least one done → testing.
    // This advances the project once all development work is complete.
    if (newStatus === "in_development" && !hasOpen && hasDone) {
      newStatus = "testing";
    }

    if (newStatus === project.status && newStartDate === project.startDate) {
      return { ok: true, changed: false };
    }

    // Concurrency guard: re-read before write to avoid overwriting concurrent admin edits.
    const freshProject = await projectRepository.findById(projectId);
    if (!freshProject) return { ok: false, error: "Proyecto no encontrado." };

    if (freshProject.status !== project.status) return { ok: true, changed: false };
    if (NO_AUTO_MUTATION.has(freshProject.status)) return { ok: true, changed: false };

    // Initialize startDate only when transitioning away from planning without a date.
    const finalStartDate: string | null =
      project.status === "planning" && !freshProject.startDate
        ? newStartDate
        : freshProject.startDate;

    await projectRepository.update(projectId, {
      name:        freshProject.name,
      description: freshProject.description,
      status:      newStatus,
      startDate:   finalStartDate,
      targetDate:  freshProject.targetDate,
      notes:       freshProject.notes,
    });

    return { ok: true, changed: true };
  } catch {
    return { ok: false, error: "No se pudo reconciliar el estado del proyecto." };
  }
}
