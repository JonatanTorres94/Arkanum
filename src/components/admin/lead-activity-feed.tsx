import type { LeadEvent } from "@/features/leads/domain/lead-event.types";
import type { LeadStatus } from "@/features/leads/domain/lead.types";

const STATUS_LABELS: Record<string, string> = {
  new:          "Nuevo",
  contacted:    "Contactado",
  qualified:    "Calificado",
  disqualified: "Descartado",
};

const QUALIFIED_STAGE_LABELS: Record<string, string> = {
  discovery_pending: "Discovery pendiente",
  proposal_pending:  "Propuesta pendiente",
  proposal_sent:     "Propuesta enviada",
  waiting_client:    "Esperando respuesta del cliente",
  accepted:          "Aceptado",
  rejected:          "Rechazado",
  project_started:   "Proyecto iniciado",
};

function StatusLabel({ value }: { value: string | null }) {
  if (!value) return <span className="text-slate-500">—</span>;
  return (
    <span className="font-medium text-slate-200">
      {STATUS_LABELS[value as LeadStatus] ?? value}
    </span>
  );
}

function QualifiedStageLabel({ value }: { value: string | null }) {
  if (!value) return <span className="text-slate-500">—</span>;
  return (
    <span className="font-medium text-slate-200">
      {QUALIFIED_STAGE_LABELS[value] ?? value}
    </span>
  );
}

export function LeadActivityFeed({ events }: { events: LeadEvent[] }) {
  if (events.length === 0) {
    return <p className="text-sm text-slate-600">Sin actividad registrada todavía.</p>;
  }

  return (
    <ol className="space-y-3">
      {events.map((event) => (
        <li
          key={event.id}
          className="rounded-lg border border-slate-800 bg-slate-900/40 px-4 py-3"
        >
          {event.type === "status_changed" && (
            <p className="text-sm text-slate-400">
              Estado:{" "}
              <StatusLabel value={event.fromStatus} />
              <span className="mx-2 text-slate-600">→</span>
              <StatusLabel value={event.toStatus} />
            </p>
          )}
          {event.type === "qualified_stage_changed" && (
            <p className="text-sm text-slate-400">
              Etapa:{" "}
              <QualifiedStageLabel value={event.fromStatus} />
              <span className="mx-2 text-slate-600">→</span>
              <QualifiedStageLabel value={event.toStatus} />
            </p>
          )}
          {event.type === "follow_up_updated" && (
            <p className="text-sm text-slate-400">
              Seguimiento:{" "}
              <span className="font-medium text-slate-200">{event.fromStatus}</span>
              <span className="mx-2 text-slate-600">→</span>
              <span className="font-medium text-slate-200">{event.toStatus}</span>
            </p>
          )}
          {event.type === "intent_fields_updated" && (
            <div className="space-y-1 text-sm text-slate-400">
              <p>Campos de intención actualizados:</p>
              <p className="text-xs text-slate-500">
                Antes: <span className="text-slate-300">{event.fromStatus}</span>
              </p>
              <p className="text-xs text-slate-500">
                Después: <span className="text-slate-300">{event.toStatus}</span>
              </p>
            </div>
          )}
          {event.type === "converted_to_client" && (
            <p className="text-sm text-slate-400">
              {event.toStatus}
            </p>
          )}
          {event.type === "converted_to_project" && (
            <p className="text-sm text-slate-400">
              {event.toStatus}
            </p>
          )}
          <p className="mt-1.5 text-xs text-slate-600">
            {event.createdBy ?? "Administrador"}
            {" · "}
            {new Date(event.createdAt).toLocaleString("es-AR")}
          </p>
        </li>
      ))}
    </ol>
  );
}
