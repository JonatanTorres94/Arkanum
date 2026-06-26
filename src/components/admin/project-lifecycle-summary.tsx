"use client";

import { useTransition } from "react";
import type { ProjectStatus } from "@/features/projects/domain/project.types";
import type { ProjectWorkItem } from "@/features/projects/domain/project-work-item.types";
import type { ProjectLifecycleAssessment } from "@/features/projects/domain/project-lifecycle";
import { applyLifecycleSuggestionAction } from "@/server/actions/admin-project.action";

// ─── Work item progress summary ───────────────────────────────────────────────

const WI_STATUS_LABELS: Record<string, string> = {
  backlog:          "Backlog",
  ready:            "Listo",
  in_progress:      "En progreso",
  blocked:          "Bloqueado",
  review:           "En revisión",
  testing:          "En testing",
  awaiting_support: "Esperando Soporte",
  done:             "Completado",
  cancelled:        "Cancelado",
};

function WorkItemProgressSummary({ workItems }: { workItems: ProjectWorkItem[] }) {
  if (workItems.length === 0) {
    return <p className="text-xs text-admin-text-faint">Sin work items registrados.</p>;
  }

  const counts: Record<string, number> = {};
  for (const wi of workItems) {
    counts[wi.status] = (counts[wi.status] ?? 0) + 1;
  }

  const orderedStatuses = [
    "in_progress", "blocked", "review", "testing", "awaiting_support",
    "ready", "backlog", "done", "cancelled",
  ];

  const rows = orderedStatuses.filter((s) => counts[s]);

  return (
    <dl className="space-y-1">
      <div className="flex justify-between text-xs">
        <dt className="text-admin-text-muted">Total</dt>
        <dd className="font-medium text-admin-text">{workItems.length}</dd>
      </div>
      {rows.map((s) => (
        <div key={s} className="flex justify-between text-xs">
          <dt className="text-admin-text-muted">{WI_STATUS_LABELS[s] ?? s}</dt>
          <dd className="font-medium text-admin-text">{counts[s]}</dd>
        </div>
      ))}
    </dl>
  );
}

// ─── Status labels (matching ProjectStatusBadge) ──────────────────────────────

const STATUS_LABELS: Record<ProjectStatus, string> = {
  discovery:      "Descubrimiento",
  planning:       "Planificación",
  in_development: "En desarrollo",
  testing:        "Testing",
  deployed:       "Deployado",
  maintenance:    "Mantenimiento",
  paused:         "Pausado",
  cancelled:      "Cancelado",
};

// ─── Apply suggestion button ──────────────────────────────────────────────────

function ApplySuggestionButton({
  projectId,
  suggestedStatus,
}: {
  projectId:       string;
  suggestedStatus: ProjectStatus;
}) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      await applyLifecycleSuggestionAction(projectId, suggestedStatus);
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="mt-2 rounded-lg border border-amber-400/30 px-3 py-1.5 text-xs font-medium text-amber-400 transition-colors hover:border-amber-400/60 hover:bg-amber-400/5 disabled:opacity-50"
    >
      {isPending
        ? "Actualizando…"
        : `Actualizar a ${STATUS_LABELS[suggestedStatus]}`}
    </button>
  );
}

// ─── Lifecycle summary ────────────────────────────────────────────────────────

export function ProjectLifecycleSummary({
  projectId,
  workItems,
  assessment,
}: {
  projectId:  string;
  workItems:  ProjectWorkItem[];
  assessment: ProjectLifecycleAssessment;
}) {
  return (
    <div className="space-y-4">
      {/* Work item progress */}
      <WorkItemProgressSummary workItems={workItems} />

      {/* Inconsistency warnings */}
      {!assessment.consistent && (
        <ul className="space-y-2">
          {assessment.inconsistencies.map((inc) => (
            <li
              key={inc.reason}
              className={`rounded-lg border px-3 py-2.5 text-xs ${
                inc.severity === "warning"
                  ? "border-amber-400/20 bg-amber-400/5 text-amber-400"
                  : "border-admin-border bg-admin-surface-hover text-admin-text-muted"
              }`}
            >
              {inc.message}
              {inc.suggestedStatus && (
                <ApplySuggestionButton
                  projectId={projectId}
                  suggestedStatus={inc.suggestedStatus}
                />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
