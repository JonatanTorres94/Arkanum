import type { LeadStatus } from "@/features/leads/domain/lead.types";

const LABELS: Record<LeadStatus, string> = {
  new:           "Nuevo",
  contacted:     "Contactado",
  qualified:     "Calificado",
  disqualified:  "Descartado",
};

const COLORS: Record<LeadStatus, string> = {
  new:          "bg-cyan-400/10 text-cyan-400 border-cyan-400/20",
  contacted:    "bg-blue-400/10 text-blue-400 border-blue-400/20",
  qualified:    "bg-emerald-400/10 text-emerald-400 border-emerald-400/20",
  disqualified: "bg-slate-400/10 text-slate-500 border-slate-700",
};

export function LeadStatusBadge({ status }: { status: LeadStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${COLORS[status]}`}
    >
      {LABELS[status]}
    </span>
  );
}
