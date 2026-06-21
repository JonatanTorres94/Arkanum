import { QUALIFIED_STAGES, type Lead, type QualifiedStage } from "@/features/leads/domain/lead.types";

const LABELS: Record<QualifiedStage, string> = {
  discovery_pending: "Discovery pendiente",
  proposal_pending:  "Propuesta pendiente",
  proposal_sent:     "Propuesta enviada",
  waiting_client:    "Esperando respuesta del cliente",
  accepted:          "Aceptado",
  rejected:          "Rechazado",
  project_started:   "Proyecto iniciado",
};

export function LeadPipelineDistribution({ leads }: { leads: Lead[] }) {
  const qualifiedLeads = leads.filter((l) => l.status === "qualified");

  if (qualifiedLeads.length === 0) return null;

  const withoutStage = qualifiedLeads.filter((l) => l.qualifiedStage === null).length;

  return (
    <div className="rounded-xl border border-admin-border bg-admin-surface p-5">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-admin-text-faint">
        Distribución de pipeline calificado
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {QUALIFIED_STAGES.map((stage) => (
          <div
            key={stage}
            className="rounded-lg border border-admin-border bg-admin-surface-hover px-3 py-2"
          >
            <p className="text-xs text-admin-text-faint">{LABELS[stage]}</p>
            <p className="mt-1 text-lg font-semibold text-admin-text">
              {qualifiedLeads.filter((l) => l.qualifiedStage === stage).length}
            </p>
          </div>
        ))}
        {withoutStage > 0 && (
          <div className="rounded-lg border border-admin-border bg-admin-surface-hover px-3 py-2">
            <p className="text-xs text-admin-text-faint">Sin etapa asignada</p>
            <p className="mt-1 text-lg font-semibold text-admin-text">{withoutStage}</p>
          </div>
        )}
      </div>
    </div>
  );
}
