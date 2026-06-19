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
    <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-slate-500">
        Distribución de pipeline calificado
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {QUALIFIED_STAGES.map((stage) => (
          <div
            key={stage}
            className="rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2"
          >
            <p className="text-xs text-slate-500">{LABELS[stage]}</p>
            <p className="mt-1 text-lg font-semibold text-slate-100">
              {qualifiedLeads.filter((l) => l.qualifiedStage === stage).length}
            </p>
          </div>
        ))}
        {withoutStage > 0 && (
          <div className="rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2">
            <p className="text-xs text-slate-500">Sin etapa asignada</p>
            <p className="mt-1 text-lg font-semibold text-slate-100">{withoutStage}</p>
          </div>
        )}
      </div>
    </div>
  );
}
