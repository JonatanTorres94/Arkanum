import type { WorkItemStatus, WorkItemPriority } from "@/features/projects/domain/project-work-item.types";
import { WORK_ITEM_STATUS_LABELS, WORK_ITEM_PRIORITY_LABELS } from "@/features/projects/domain/project-work-item-labels";

const STATUS_COLORS: Record<WorkItemStatus, string> = {
  backlog:          "bg-slate-400/10 text-slate-400 border-slate-700",
  ready:            "bg-blue-400/10 text-blue-400 border-blue-400/20",
  in_progress:      "bg-violet-400/10 text-violet-400 border-violet-400/20",
  blocked:          "bg-red-400/10 text-red-400 border-red-400/20",
  review:           "bg-cyan-400/10 text-cyan-400 border-cyan-400/20",
  testing:          "bg-amber-400/10 text-amber-400 border-amber-400/20",
  awaiting_support: "bg-orange-400/10 text-orange-400 border-orange-400/20",
  done:             "bg-emerald-400/10 text-emerald-400 border-emerald-400/20",
  cancelled:        "bg-slate-400/10 text-slate-400 border-slate-700",
};

const PRIORITY_COLORS: Record<WorkItemPriority, string> = {
  low:    "bg-slate-400/10 text-slate-400 border-slate-700",
  medium: "bg-cyan-400/10 text-cyan-400 border-cyan-400/20",
  high:   "bg-amber-400/10 text-amber-400 border-amber-400/20",
  urgent: "bg-red-400/10 text-red-400 border-red-400/20",
};

export function WorkItemStatusBadge({ status }: { status: WorkItemStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[status]}`}
    >
      {WORK_ITEM_STATUS_LABELS[status]}
    </span>
  );
}

export function WorkItemPriorityBadge({ priority }: { priority: WorkItemPriority }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${PRIORITY_COLORS[priority]}`}
    >
      {WORK_ITEM_PRIORITY_LABELS[priority]}
    </span>
  );
}
