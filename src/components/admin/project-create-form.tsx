"use client";

import { useActionState } from "react";
import { PROJECT_STATUSES, type ProjectStatus } from "@/features/projects/domain/project.types";
import { createProjectAction } from "@/server/actions/admin-project.action";

const STATUS_LABELS: Record<ProjectStatus, string> = {
  discovery:      "Discovery",
  planning:       "Planificación",
  in_development: "En desarrollo",
  testing:        "Testing",
  deployed:       "Desplegado",
  maintenance:    "Mantenimiento",
  paused:         "Pausado",
  cancelled:      "Cancelado",
};

const inputClass =
  "w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder-slate-600 transition-colors focus:border-cyan-400 focus:outline-none disabled:opacity-50";

const labelClass = "mb-1.5 block text-sm font-medium text-slate-300";

export function ProjectCreateForm({
  clients,
  defaultClientId,
}: {
  clients: { id: string; name: string }[];
  defaultClientId?: string;
}) {
  const [state, action, pending] = useActionState(createProjectAction, null);

  return (
    <form action={action} className="space-y-5">
      {state?.error && (
        <p role="alert" className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {state.error}
        </p>
      )}

      <div>
        <label htmlFor="clientId" className={labelClass}>
          Cliente <span className="text-red-400">*</span>
        </label>
        <select
          id="clientId"
          name="clientId"
          required
          defaultValue={defaultClientId ?? ""}
          disabled={pending}
          className={`${inputClass} cursor-pointer`}
        >
          <option value="" disabled>
            Seleccionar cliente
          </option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>{client.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="name" className={labelClass}>
          Nombre del proyecto <span className="text-red-400">*</span>
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          disabled={pending}
          placeholder="Sistema de gestión de pedidos"
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
          placeholder="Alcance general del proyecto."
          className={`${inputClass} resize-none`}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div>
          <label htmlFor="status" className={labelClass}>
            Estado
          </label>
          <select
            id="status"
            name="status"
            defaultValue="planning"
            disabled={pending}
            className={`${inputClass} cursor-pointer`}
          >
            {PROJECT_STATUSES.map((status) => (
              <option key={status} value={status}>{STATUS_LABELS[status]}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="startDate" className={labelClass}>
            Fecha de inicio
          </label>
          <input
            id="startDate"
            name="startDate"
            type="date"
            disabled={pending}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="targetDate" className={labelClass}>
            Fecha objetivo
          </label>
          <input
            id="targetDate"
            name="targetDate"
            type="date"
            disabled={pending}
            className={inputClass}
          />
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
          placeholder="Contexto interno, acuerdos, riesgos, etc."
          className={`${inputClass} resize-none`}
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-cyan-400 px-6 py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? "Creando..." : "Crear proyecto"}
      </button>
    </form>
  );
}
