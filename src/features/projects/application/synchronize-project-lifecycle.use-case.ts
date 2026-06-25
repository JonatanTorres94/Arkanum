import type { ProjectStatus } from "@/features/projects/domain/project.types";
import { OPEN_WORK_ITEM_STATUSES } from "@/features/projects/domain/project-lifecycle";
import type { ProjectRepository } from "@/features/projects/infrastructure/project.repository";
import type { ProjectWorkItemRepository } from "@/features/projects/infrastructure/project-work-item.repository";

// Argentina never observes DST — offset is always UTC-3.
function todayArgentina(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Argentina/Buenos_Aires",
  }).format(new Date());
}

// Statuses from which the lifecycle can auto-advance or auto-regress.
// Deployed, maintenance, paused, and cancelled are left untouched —
// those transitions are admin intent.
const AUTO_ADVANCEABLE: ProjectStatus[] = ["planning", "in_development", "testing"];

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

    if (!AUTO_ADVANCEABLE.includes(project.status)) {
      return { ok: true, changed: false };
    }

    const workItems = await workItemRepository.findByProjectId(projectId);
    if (workItems.length === 0) return { ok: true, changed: false };

    const openStatuses  = new Set<string>(OPEN_WORK_ITEM_STATUSES);
    const hasOpen       = workItems.some((wi) => openStatuses.has(wi.status));
    const hasInProgress = workItems.some((wi) => wi.status === "in_progress");
    const hasDone       = workItems.some((wi) => wi.status === "done");

    let newStatus: ProjectStatus = project.status;
    let newStartDate              = project.startDate;

    // Rule 1: planning → in_development when any work item is in_progress.
    // Sets startDate to today (Argentina) if it was not already set.
    if (project.status === "planning" && hasInProgress) {
      newStatus = "in_development";
      if (!newStartDate) newStartDate = todayArgentina();
    }

    // Rule 2: planning/in_development → testing when no open items remain and
    // at least one is done. Uses effectiveStatus (post-Rule-1) so a project can
    // jump directly planning → testing if the only work item is created as done.
    const effectiveStatus = newStatus;
    if (
      (effectiveStatus === "planning" || effectiveStatus === "in_development") &&
      !hasOpen &&
      hasDone
    ) {
      newStatus = "testing";
    }

    // Rule 3: testing → in_development when any open work item reappears.
    // Does not touch startDate — the project already started; regression only
    // reflects that work is still ongoing.
    // Uses project.status (original) so a Rule-2 advance in the same call
    // (planning/in_development → testing) does not immediately reverse itself.
    if (project.status === "testing" && hasOpen) {
      newStatus = "in_development";
    }

    if (newStatus === project.status && newStartDate === project.startDate) {
      return { ok: true, changed: false };
    }

    await projectRepository.update(projectId, {
      name:        project.name,
      description: project.description,
      status:      newStatus,
      startDate:   newStartDate,
      targetDate:  project.targetDate,
      notes:       project.notes,
    });

    return { ok: true, changed: true };
  } catch {
    return { ok: false, error: "No se pudo sincronizar el estado del proyecto." };
  }
}
