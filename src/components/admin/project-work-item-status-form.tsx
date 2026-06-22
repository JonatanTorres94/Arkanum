"use client";

import { useState, useTransition } from "react";
import { WORK_ITEM_STATUSES, type WorkItemStatus } from "@/features/projects/domain/project-work-item.types";
import { updateProjectWorkItemStatusAction } from "@/server/actions/admin-project-work-item.action";

const LABELS: Record<WorkItemStatus, string> = {
  backlog:     "Backlog",
  ready:       "Listo para iniciar",
  in_progress: "En progreso",
  blocked:     "Bloqueado",
  review:      "En revisión",
  testing:     "Testing",
  done:        "Hecho",
  cancelled:   "Cancelado",
};

export function ProjectWorkItemStatusForm({
  workItemId,
  currentStatus,
}: {
  workItemId: string;
  currentStatus: WorkItemStatus;
}) {
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const status = e.target.value;
    setFeedback(null);
    startTransition(async () => {
      const result = await updateProjectWorkItemStatusAction(workItemId, status);
      if (result.error) {
        e.target.value = currentStatus;
        setFeedback(result.error);
      } else if (result.warning) {
        setFeedback(result.warning);
      }
    });
  }

  return (
    <div>
      <select
        defaultValue={currentStatus}
        onChange={handleChange}
        disabled={isPending}
        className="rounded-lg border border-admin-border-strong bg-admin-bg px-3 py-2 text-sm text-admin-text focus:border-admin-accent focus:outline-none disabled:opacity-50"
      >
        {WORK_ITEM_STATUSES.map((status) => (
          <option key={status} value={status}>{LABELS[status]}</option>
        ))}
      </select>
      {feedback && (
        <p role="alert" className="mt-2 text-xs text-admin-danger">
          {feedback}
        </p>
      )}
    </div>
  );
}
