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

// Statuses from which the lifecycle can auto-advance. Deployed, maintenance,
// paused, and cancelled are left untouched — those transitions are admin intent.
const AUTO_ADVANCEABLE: ProjectStatus[] = ["planning", "in_development"];

export type SyncLifecycleResult =
  | { ok: true; changed: boolean }
  | { ok: false; error: string };

export async function synchronizeProjectLifecycleUseCase(
  projectId: string,
  projectRepository: ProjectRepository,
  workItemRepository: ProjectWorkItemRepository
): Promise<SyncLifecycleResult> {
  const project = await projectRepository.findById(projectId);
  if (!project) return { ok: false, error: "Proyecto no encontrado." };

  if (!AUTO_ADVANCEABLE.includes(project.status)) {
    return { ok: true, changed: false };
  }

  const workItems = await workItemRepository.findByProjectId(projectId);
  if (workItems.length === 0) return { ok: true, changed: false };

  const openStatuses = new Set<string>(OPEN_WORK_ITEM_STATUSES);
  const hasOpen      = workItems.some((wi) => openStatuses.has(wi.status));
  const hasInProgress = workItems.some((wi) => wi.status === "in_progress");
  const hasDone       = workItems.some((wi) => wi.status === "done");

  let newStatus: ProjectStatus = project.status;
  let newStartDate              = project.startDate;

  // Rule 1: planning → in_development when any work item is in_progress.
  if (project.status === "planning" && hasInProgress) {
    newStatus = "in_development";
    if (!newStartDate) newStartDate = todayArgentina();
  }

  // Rule 2: planning/in_development → testing when no open items remain and
  // at least one is done. Evaluates against newStatus so rule 1 can't block it
  // (if a work item moved to done from in_progress in the same sync the project
  // would already be in_development from rule 1, but hasDone would be true and
  // hasOpen false — correct advance to testing).
  const effectiveStatus = newStatus;
  if (
    (effectiveStatus === "planning" || effectiveStatus === "in_development") &&
    !hasOpen &&
    hasDone
  ) {
    newStatus = "testing";
  }

  if (newStatus === project.status && newStartDate === project.startDate) {
    return { ok: true, changed: false };
  }

  try {
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
