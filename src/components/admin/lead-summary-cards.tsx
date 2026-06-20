import { LEAD_STATUSES, type Lead, type LeadStatus } from "@/features/leads/domain/lead.types";

const LABELS: Record<LeadStatus, string> = {
  new:          "Nuevos",
  contacted:    "Contactados",
  qualified:    "Calificados",
  disqualified: "Descartados",
};

// Literal hues on purpose (not tokenized) — this distinguishes 4 statuses
// from each other, same reasoning as the status badge components.
const COLORS: Record<LeadStatus, string> = {
  new:          "text-cyan-400",
  contacted:    "text-blue-400",
  qualified:    "text-green-400",
  disqualified: "text-slate-500",
};

export function LeadSummaryCards({ leads }: { leads: Lead[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {LEAD_STATUSES.map((status) => {
        const count = leads.filter((l) => l.status === status).length;
        return (
          <div
            key={status}
            className="rounded-xl border border-admin-border bg-admin-surface px-4 py-3"
          >
            <p className="text-xs text-admin-text-faint">{LABELS[status]}</p>
            <p className={`mt-1 text-2xl font-semibold ${COLORS[status]}`}>{count}</p>
          </div>
        );
      })}
    </div>
  );
}
