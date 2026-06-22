"use client";

import { useState, useTransition } from "react";
import {
  TICKET_SOURCES,
  TICKET_CATEGORIES,
  TICKET_PRIORITIES,
  type TicketSource,
  type TicketCategory,
  type TicketPriority,
} from "@/features/support/domain/support-ticket.types";
import { updateSupportTicketDetailsAction } from "@/server/actions/admin-support-ticket.action";

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

const PRIORITY_LABELS: Record<TicketPriority, string> = {
  low:    "Baja",
  medium: "Media",
  high:   "Alta",
  urgent: "Urgente",
};

const inputClass =
  "w-full rounded-lg border border-admin-border-strong bg-admin-bg px-3 py-2 text-sm text-admin-text placeholder-admin-text-faint transition-colors focus:border-admin-accent focus:outline-none disabled:opacity-50";

const labelClass = "mb-1.5 block text-sm font-medium text-admin-text-secondary";

type ProjectOption = { id: string; name: string };

export function SupportTicketDetailsForm({
  ticketId,
  title,
  description,
  projectId,
  projects,
  reportedBy,
  source,
  category,
  priority,
  projectLocked,
  onCancel,
  onSaved,
}: {
  ticketId: string;
  title: string;
  description: string | null;
  projectId: string | null;
  projects: ProjectOption[];
  reportedBy: string | null;
  source: TicketSource;
  category: TicketCategory;
  priority: TicketPriority;
  projectLocked: boolean;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    setError(null);
    startTransition(async () => {
      const result = await updateSupportTicketDetailsAction(ticketId, formData);
      if (result?.error) {
        setError(result.error);
        return;
      }
      onSaved();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <p role="alert" className="text-xs text-admin-danger">
          {error}
        </p>
      )}

      <div>
        <label htmlFor="title" className={labelClass}>
          Título
        </label>
        <input
          id="title"
          name="title"
          type="text"
          defaultValue={title}
          required
          disabled={isPending}
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
          rows={4}
          defaultValue={description ?? ""}
          disabled={isPending}
          className={`${inputClass} resize-none`}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="projectId" className={labelClass}>
            Proyecto
          </label>
          <select
            id="projectId"
            name="projectId"
            defaultValue={projectId ?? ""}
            disabled={isPending || projectLocked}
            className={`${inputClass} cursor-pointer`}
          >
            <option value="">Sin proyecto asociado</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>{project.name}</option>
            ))}
          </select>
          {projectLocked && (
            <p className="mt-1.5 text-xs text-admin-text-faint">
              Los cambios posteriores del ticket no modifican automáticamente el work item escalado.
            </p>
          )}
        </div>

        <div>
          <label htmlFor="reportedBy" className={labelClass}>
            Reportado por
          </label>
          <input
            id="reportedBy"
            name="reportedBy"
            type="text"
            defaultValue={reportedBy ?? ""}
            disabled={isPending}
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
            defaultValue={source}
            disabled={isPending}
            className={`${inputClass} cursor-pointer`}
          >
            {TICKET_SOURCES.map((opt) => (
              <option key={opt} value={opt}>{SOURCE_LABELS[opt]}</option>
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
            defaultValue={category}
            disabled={isPending}
            className={`${inputClass} cursor-pointer`}
          >
            {TICKET_CATEGORIES.map((opt) => (
              <option key={opt} value={opt}>{CATEGORY_LABELS[opt]}</option>
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
            defaultValue={priority}
            disabled={isPending}
            className={`${inputClass} cursor-pointer`}
          >
            {TICKET_PRIORITIES.map((opt) => (
              <option key={opt} value={opt}>{PRIORITY_LABELS[opt]}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg border border-admin-border-strong px-4 py-2 text-sm text-admin-text-secondary transition-colors hover:border-admin-accent hover:text-admin-text disabled:opacity-50"
        >
          {isPending ? "Guardando..." : "Guardar cambios"}
        </button>

        <button
          type="button"
          onClick={onCancel}
          disabled={isPending}
          className="rounded-lg px-4 py-2 text-sm text-admin-text-faint transition-colors hover:text-admin-text disabled:opacity-50"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
