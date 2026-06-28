import type { LeadPriority } from "@/features/leads/domain/lead-priority";

const LABELS: Record<LeadPriority, string> = {
  alta:  "Alta",
  media: "Media",
  baja:  "Baja",
};

const COLORS: Record<LeadPriority, string> = {
  alta:  "bg-rose-400/10  text-rose-400  border-rose-400/20",
  media: "bg-amber-400/10 text-amber-400 border-amber-400/20",
  baja:  "bg-slate-400/10 text-slate-500 border-slate-700",
};

export function LeadPriorityBadge({ priority }: { priority: LeadPriority }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${COLORS[priority]}`}
    >
      {LABELS[priority]}
    </span>
  );
}
