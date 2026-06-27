import type { ProjectStatus } from "@/features/projects/domain/project.types";
import type { ProjectRepository } from "@/features/projects/infrastructure/project.repository";

// Argentina never observes DST — offset is always UTC-3.
function todayArgentina(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Argentina/Buenos_Aires",
  }).format(new Date());
}

// Named triggers help callers express intent and enable future per-trigger logic.
export type ReopenTrigger = "support_intervention" | "new_active_work_item";

export type ReopenProjectResult =
  | { ok: true; changed: boolean }
  | { ok: false; error: string };

// Target status for each eligible source status on an explicit rework trigger.
// Statuses absent from this map (paused, cancelled, discovery) are never
// auto-mutated — only an explicit admin action may move them.
// deployed and maintenance are intentionally included: post-deployment or
// maintenance rework incidents must be able to reopen the project for
// development. The existing manual matrix already permits those transitions.
const REOPEN_TARGET: Partial<Record<ProjectStatus, ProjectStatus>> = {
  planning:       "in_development",
  testing:        "in_development",
  deployed:       "in_development",
  maintenance:    "in_development",
  // in_development: already at target — callers get changed:false via the
  //                 early-exit guard below.
};

export async function reopenProjectForDevelopmentUseCase(
  projectId: string,
  projectRepository: ProjectRepository,
  trigger: ReopenTrigger
): Promise<ReopenProjectResult> {
  // trigger is a required named argument so callers must declare intent.
  // Future iterations may use it for per-trigger logic or audit trails.
  void trigger;
  try {
    const project = await projectRepository.findById(projectId);
    if (!project) return { ok: false, error: "Proyecto no encontrado." };

    const targetStatus = REOPEN_TARGET[project.status];

    // in_development is already the goal — no write needed.
    if (!targetStatus || project.status === "in_development") {
      return { ok: true, changed: false };
    }

    // Only initialize startDate when advancing from planning without one.
    // All other transitions preserve the existing date.
    const newStartDate =
      project.status === "planning" && !project.startDate
        ? todayArgentina()
        : project.startDate;

    // Concurrency guard: re-read current state before writing so a concurrent
    // manual edit is not silently overwritten.
    const freshProject = await projectRepository.findById(projectId);
    if (!freshProject) return { ok: false, error: "Proyecto no encontrado." };

    const freshTarget = REOPEN_TARGET[freshProject.status];
    if (!freshTarget || freshProject.status === "in_development") {
      return { ok: true, changed: false };
    }

    const freshStartDate =
      freshProject.status === "planning" && !freshProject.startDate
        ? newStartDate
        : freshProject.startDate;

    await projectRepository.update(projectId, {
      name:        freshProject.name,
      description: freshProject.description,
      status:      freshTarget,
      startDate:   freshStartDate,
      targetDate:  freshProject.targetDate,
      notes:       freshProject.notes,
    });

    return { ok: true, changed: true };
  } catch {
    return { ok: false, error: "No se pudo reabrir el proyecto para desarrollo." };
  }
}
