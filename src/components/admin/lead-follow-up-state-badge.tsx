import type { LeadFollowUpState } from "@/features/leads/domain/lead-follow-up-state";

const LABELS: Record<LeadFollowUpState, string> = {
  overdue:   "Vencido",
  today:     "Hoy",
  scheduled: "Programado",
  missing:   "Sin acción",
};

const COLORS: Record<LeadFollowUpState, string> = {
  overdue:   "bg-rose-400/10  text-rose-400  border-rose-400/20",
  today:     "bg-amber-400/10 text-amber-400 border-amber-400/20",
  scheduled: "bg-indigo-400/10 text-indigo-400 border-indigo-400/20",
  missing:   "bg-slate-400/10 text-slate-500 border-slate-700",
};

export function LeadFollowUpStateBadge({ state }: { state: LeadFollowUpState }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${COLORS[state]}`}
    >
      {LABELS[state]}
    </span>
  );
}
