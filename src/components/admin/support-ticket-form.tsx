"use client";

import { useActionState, useState } from "react";
import {
  TICKET_SOURCES,
  TICKET_CATEGORIES,
  TICKET_STATUSES,
  TICKET_PRIORITIES,
  type TicketSource,
  type TicketCategory,
  type TicketStatus,
  type TicketPriority,
} from "@/features/support/domain/support-ticket.types";
import { createSupportTicketAction } from "@/server/actions/admin-support-ticket.action";

const SOURCE_LABELS: Record<TicketSource, string> = {
  email:         "Email",
  whatsapp:      "WhatsApp",
  manual:        "Manual",
  client_portal: "Portal cliente",
  internal:      "Interno",
};

const CATEGORY_LABELS: Record<TicketCategory, string> = {
  question:       "Pregunta",
  configuration:  "Configuración",
  bug_report:     "Reporte de bug",
  incident:       "Incidente",
  change_request: "Pedido de cambio",
  training:       "Capacitación",
  billing:        "Facturación",
  access_issue:   "Problema de acceso",
};

const STATUS_LABELS: Record<TicketStatus, string> = {
  new:                      "Nuevo",
  triage:                   "Triage",
  waiting_client:           "Esperando cliente",
  waiting_internal:         "Esperando interno",
  escalated_to_development: "Escalado a desarrollo",
  resolved:                 "Resuelto",
  closed:                   "Cerrado",
  cancelled:                "Cancelado",
};

const PRIORITY_LABELS: Record<TicketPriority, string> = {
  low:    "Baja",
  medium: "Media",
  high:   "Alta",
  urgent: "Urgente",
};

const inputClass =
  "w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder-slate-600 transition-colors focus:border-cyan-400 focus:outline-none disabled:opacity-50";

const labelClass = "mb-1.5 block text-sm font-medium text-slate-300";

type ClientOption = { id: string; name: string };
type ProjectOption = { id: string; name: string; clientId: string };

export function SupportTicketForm({
  clients,
  projects,
}: {
  clients: ClientOption[];
  projects: ProjectOption[];
}) {
  const [state, action, pending] = useActionState(createSupportTicketAction, null);
  const [selectedClientId, setSelectedClientId] = useState("");

  const availableProjects = projects.filter((p) => p.clientId === selectedClientId);

  return (
    <form action={action} className="space-y-5">
      {state?.error && (
        <p role="alert" className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {state.error}
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="clientId" className={labelClass}>
            Cliente <span className="text-red-400">*</span>
          </label>
          <select
            id="clientId"
            name="clientId"
            required
            value={selectedClientId}
            onChange={(e) => setSelectedClientId(e.target.value)}
            disabled={pending}
            className={`${inputClass} cursor-pointer`}
          >
            <option value="" disabled>Seleccionar cliente</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>{client.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="projectId" className={labelClass}>
            Proyecto
          </label>
          <select
            id="projectId"
            name="projectId"
            defaultValue=""
            disabled={pending || !selectedClientId}
            className={`${inputClass} cursor-pointer`}
          >
            <option value="">Sin proyecto asociado</option>
            {availableProjects.map((project) => (
              <option key={project.id} value={project.id}>{project.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="title" className={labelClass}>
          Título <span className="text-red-400">*</span>
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          disabled={pending}
          placeholder="No puedo acceder al panel de pedidos"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="description" className={labelClass}>
          Descripción
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          disabled={pending}
          className={`${inputClass} resize-none`}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="reportedBy" className={labelClass}>
            Reportado por
          </label>
          <input
            id="reportedBy"
            name="reportedBy"
            type="text"
            disabled={pending}
            placeholder="Nombre de quien reportó"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="source" className={labelClass}>
            Fuente
          </label>
          <select
            id="source"
            name="source"
            defaultValue="manual"
            disabled={pending}
            className={`${inputClass} cursor-pointer`}
          >
            {TICKET_SOURCES.map((source) => (
              <option key={source} value={source}>{SOURCE_LABELS[source]}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="category" className={labelClass}>
            Categoría
          </label>
          <select
            id="category"
            name="category"
            defaultValue="question"
            disabled={pending}
            className={`${inputClass} cursor-pointer`}
          >
            {TICKET_CATEGORIES.map((category) => (
              <option key={category} value={category}>{CATEGORY_LABELS[category]}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="status" className={labelClass}>
            Estado
          </label>
          <select
            id="status"
            name="status"
            defaultValue="new"
            disabled={pending}
            className={`${inputClass} cursor-pointer`}
          >
            {TICKET_STATUSES.map((status) => (
              <option key={status} value={status}>{STATUS_LABELS[status]}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="priority" className={labelClass}>
            Prioridad
          </label>
          <select
            id="priority"
            name="priority"
            defaultValue="medium"
            disabled={pending}
            className={`${inputClass} cursor-pointer`}
          >
            {TICKET_PRIORITIES.map((priority) => (
              <option key={priority} value={priority}>{PRIORITY_LABELS[priority]}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="notes" className={labelClass}>
          Notas internas
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          disabled={pending}
          className={`${inputClass} resize-none`}
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-cyan-400 px-6 py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? "Creando..." : "Crear ticket"}
      </button>
    </form>
  );
}
