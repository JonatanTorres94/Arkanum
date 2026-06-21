import type { Lead } from "@/features/leads/domain/lead.types";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

// Highest-urgency tier and "no defined budget" option, per lead.schema.ts —
// not stored as separate flags, so we match against the literal enum values.
const HIGH_URGENCY_VALUE = "Lo necesitamos cuanto antes";
const UNDEFINED_BUDGET_VALUE = "No tenemos cifra definida aún";

export function LeadOperationalMetrics({ leads }: { leads: Lead[] }) {
  const now = new Date().getTime();

  const metrics = [
    {
      label: "Últimos 7 días",
      value: leads.filter((l) => now - new Date(l.createdAt).getTime() <= SEVEN_DAYS_MS).length,
    },
    {
      label: "Calificados",
      value: leads.filter((l) => l.status === "qualified").length,
    },
    {
      label: "Alta urgencia",
      value: leads.filter((l) => l.urgency === HIGH_URGENCY_VALUE).length,
    },
    {
      label: "Con presupuesto definido",
      value: leads.filter((l) => l.budget !== UNDEFINED_BUDGET_VALUE).length,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {metrics.map((metric) => (
        <div
          key={metric.label}
          className="rounded-xl border border-admin-border bg-admin-surface px-4 py-3"
        >
          <p className="text-xs text-admin-text-faint">{metric.label}</p>
          <p className="mt-1 text-2xl font-semibold text-admin-accent">{metric.value}</p>
        </div>
      ))}
    </div>
  );
}
