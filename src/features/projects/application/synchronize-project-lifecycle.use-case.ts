import type { ProjectStatus } from "@/features/projects/domain/project.types";
import { PROTECTED_PROJECT_STATUSES } from "@/features/projects/domain/project-lifecycle";
import type { ProjectRepository } from "@/features/projects/infrastructure/project.repository";
import type { ProjectWorkItemRepository } from "@/features/projects/infrastructure/project-work-item.repository";

// Argentina never observes DST — offset is always UTC-3.
function todayArgentina(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Argentina/Buenos_Aires",
  }).format(new Date());
}

// Statuses from which the lifecycle can auto-advance.
// Protected statuses (deployed, maintenance, paused, cancelled, discovery)
// are never touched automatically — those transitions require explicit admin intent.
const AUTO_ADVANCEABLE: ProjectStatus[] = ["planning", "in_development"];

export type SyncLifecycleResult =
  | { ok: true; changed: boolean }
  | { ok: false; error: string };

export async function synchronizeProjectLifecycleUseCase(
  projectId: string,
  projectRepository: ProjectRepository,
  workItemRepository: ProjectWorkItemRepository
): Promise<SyncLifecycleResult> {
  // The entire sync is wrapped so any read or write failure becomes a
  // recoverable { ok: false } instead of an unhandled exception. The caller
  // (updateProjectWorkItemStatusAction / createProjectWorkItemAction) treats a
  // failed sync as a warning, not a total error — the work item change already
  // succeeded by the time sync runs.
  try {
    const project = await projectRepository.findById(projectId);
    if (!project) return { ok: false, error: "Proyecto no encontrado." };

    // Protected statuses are never mutated automatically.
    if (
      !AUTO_ADVANCEABLE.includes(project.status) ||
      PROTECTED_PROJECT_STATUSES.includes(project.status)
    ) {
      return { ok: true, changed: false };
    }

    const workItems = await workItemRepository.findByProjectId(projectId);
    if (workItems.length === 0) return { ok: true, changed: false };

    const hasInProgress = workItems.some((wi) => wi.status === "in_progress");
    const hasTesting    = workItems.some((wi) => wi.status === "testing");

    let newStatus:    ProjectStatus = project.status;
    let newStartDate: string | null = project.startDate;

    // Rule 1: planning → in_development when any work item enters in_progress.
    // Sets startDate to today (Argentina) if it was not already set.
    if (project.status === "planning" && hasInProgress) {
      newStatus = "in_development";
      if (!newStartDate) newStartDate = todayArgentina();
    }

    // Rule 2: planning/in_development → testing when any work item is in testing.
    // Uses effectiveStatus (post-Rule-1) so a project can advance directly
    // planning → testing if a WI is already testing when sync runs.
    // Initializes startDate if transitioning from planning with no startDate.
    const effectiveStatus = newStatus;
    if (
      (effectiveStatus === "planning" || effectiveStatus === "in_development") &&
      hasTesting
    ) {
      newStatus = "testing";
      if (effectiveStatus === "planning" && !newStartDate) {
        newStartDate = todayArgentina();
      }
    }

    // No regression: once a project reaches testing, it stays there until an
    // admin manually changes it. Automatic synchronization only advances.

    if (newStatus === project.status && newStartDate === project.startDate) {
      return { ok: true, changed: false };
    }

    // Re-read current status to guard against concurrent manual edits
    // overwriting a newer admin-set status with stale automatic state.
    const freshProject = await projectRepository.findById(projectId);
    if (!freshProject) return { ok: false, error: "Proyecto no encontrado." };

    // If the project was concurrently updated to a protected or further-ahead
    // status, skip the automatic transition.
    if (
      PROTECTED_PROJECT_STATUSES.includes(freshProject.status) ||
      !AUTO_ADVANCEABLE.includes(freshProject.status)
    ) {
      return { ok: true, changed: false };
    }

    await projectRepository.update(projectId, {
      name:        freshProject.name,
      description: freshProject.description,
      status:      newStatus,
      startDate:   newStartDate,
      targetDate:  freshProject.targetDate,
      notes:       freshProject.notes,
    });

    return { ok: true, changed: true };
  } catch {
    return { ok: false, error: "No se pudo sincronizar el estado del proyecto." };
  }
}
