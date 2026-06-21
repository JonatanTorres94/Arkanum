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
  if (!value) return <span className="text-admin-text-faint">—</span>;
  return (
    <span className="font-medium text-admin-text">
      {STATUS_LABELS[value as LeadStatus] ?? value}
    </span>
  );
}

function QualifiedStageLabel({ value }: { value: string | null }) {
  if (!value) return <span className="text-admin-text-faint">—</span>;
  return (
    <span className="font-medium text-admin-text">
      {QUALIFIED_STAGE_LABELS[value] ?? value}
    </span>
  );
}

export function LeadActivityFeed({ events }: { events: LeadEvent[] }) {
  if (events.length === 0) {
    return <p className="text-sm text-admin-text-faint">Sin actividad registrada todavía.</p>;
  }

  return (
    <ol className="space-y-3">
      {events.map((event) => (
        <li
          key={event.id}
          className="rounded-lg border border-admin-border bg-admin-surface-hover px-4 py-3"
        >
          {event.type === "status_changed" && (
            <p className="text-sm text-admin-text-muted">
              Estado:{" "}
              <StatusLabel value={event.fromStatus} />
              <span className="mx-2 text-admin-text-faint">→</span>
              <StatusLabel value={event.toStatus} />
            </p>
          )}
          {event.type === "qualified_stage_changed" && (
            <p className="text-sm text-admin-text-muted">
              Etapa:{" "}
              <QualifiedStageLabel value={event.fromStatus} />
              <span className="mx-2 text-admin-text-faint">→</span>
              <QualifiedStageLabel value={event.toStatus} />
            </p>
          )}
          {event.type === "follow_up_updated" && (
            <p className="text-sm text-admin-text-muted">
              Seguimiento:{" "}
              <span className="font-medium text-admin-text">{event.fromStatus}</span>
              <span className="mx-2 text-admin-text-faint">→</span>
              <span className="font-medium text-admin-text">{event.toStatus}</span>
            </p>
          )}
          {event.type === "intent_fields_updated" && (
            <div className="space-y-1 text-sm text-admin-text-muted">
              <p>Campos de intención actualizados:</p>
              <p className="text-xs text-admin-text-faint">
                Antes: <span className="text-admin-text-secondary">{event.fromStatus}</span>
              </p>
              <p className="text-xs text-admin-text-faint">
                Después: <span className="text-admin-text-secondary">{event.toStatus}</span>
              </p>
            </div>
          )}
          {event.type === "converted_to_client" && (
            <p className="text-sm text-admin-text-muted">
              {event.toStatus}
            </p>
          )}
          {event.type === "converted_to_project" && (
            <p className="text-sm text-admin-text-muted">
              {event.toStatus}
            </p>
          )}
          <p className="mt-1.5 text-xs text-admin-text-faint">
            {event.createdBy ?? "Administrador"}
            {" · "}
            {new Date(event.createdAt).toLocaleString("es-AR")}
          </p>
        </li>
      ))}
    </ol>
  );
}
