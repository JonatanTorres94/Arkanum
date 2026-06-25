"use client";

import { useRef, useState, useTransition } from "react";
import {
  WORK_ITEM_CATEGORIES,
  WORK_ITEM_STATUSES,
  WORK_ITEM_PRIORITIES,
  type WorkItemCategory,
  type WorkItemStatus,
  type WorkItemPriority,
} from "@/features/projects/domain/project-work-item.types";
import { createProjectWorkItemAction } from "@/server/actions/admin-project-work-item.action";

const CATEGORY_LABELS: Record<WorkItemCategory, string> = {
  feature:             "Feature",
  bug:                 "Bug",
  task:                "Tarea",
  improvement:         "Mejora",
  technical_debt:      "Deuda técnica",
  research:            "Investigación",
  support_escalation:  "Escalación de soporte",
};

const STATUS_LABELS: Record<WorkItemStatus, string> = {
  backlog:     "Backlog",
  ready:       "Listo para iniciar",
  in_progress: "En progreso",
  blocked:     "Bloqueado",
  review:      "En revisión",
  testing:     "Testing",
  done:        "Completado",
  cancelled:   "Cancelado",
};

const PRIORITY_LABELS: Record<WorkItemPriority, string> = {
  low:    "Baja",
  medium: "Media",
  high:   "Alta",
  urgent: "Urgente",
};

const inputClass =
  "w-full rounded-lg border border-admin-border-strong bg-admin-bg px-3 py-2 text-sm text-admin-text placeholder-admin-text-faint transition-colors focus:border-admin-accent focus:outline-none disabled:opacity-50";

const labelClass = "mb-1.5 block text-xs font-medium text-admin-text-muted";

export function ProjectWorkItemForm({ projectId }: { projectId: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError]           = useState<string | null>(null);
  const formRef                     = useRef<HTMLFormElement>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setError(null);

    startTransition(async () => {
      const result = await createProjectWorkItemAction(projectId, {
        title:       (data.get("title") as string) ?? "",
        description: (data.get("description") as string) ?? "",
        category:    (data.get("category") as string) ?? "",
        status:      (data.get("status") as string) ?? "",
        priority:    (data.get("priority") as string) ?? "",
        notes:       (data.get("notes") as string) ?? "",
      });
      if (result.error) {
        setError(result.error);
      } else {
        formRef.current?.reset();
      }
    });
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-3">
      {error && (
        <p role="alert" className="text-xs text-admin-danger">{error}</p>
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="sm:col-span-3">
          <label htmlFor="wi-title" className={labelClass}>Título</label>
          <input
            id="wi-title"
            name="title"
            type="text"
            required
            disabled={isPending}
            placeholder="Agregar paginación al listado de pedidos"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="wi-category" className={labelClass}>Categoría</label>
          <select
            id="wi-category"
            name="category"
            defaultValue="task"
            disabled={isPending}
            className={`${inputClass} cursor-pointer`}
          >
            {WORK_ITEM_CATEGORIES.map((category) => (
              <option key={category} value={category}>{CATEGORY_LABELS[category]}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="wi-status" className={labelClass}>Estado</label>
          <select
            id="wi-status"
            name="status"
            defaultValue="backlog"
            disabled={isPending}
            className={`${inputClass} cursor-pointer`}
          >
            {WORK_ITEM_STATUSES.map((status) => (
              <option key={status} value={status}>{STATUS_LABELS[status]}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="wi-priority" className={labelClass}>Prioridad</label>
          <select
            id="wi-priority"
            name="priority"
            defaultValue="medium"
            disabled={isPending}
            className={`${inputClass} cursor-pointer`}
          >
            {WORK_ITEM_PRIORITIES.map((priority) => (
              <option key={priority} value={priority}>{PRIORITY_LABELS[priority]}</option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-3">
          <label htmlFor="wi-description" className={labelClass}>Descripción</label>
          <textarea
            id="wi-description"
            name="description"
            rows={2}
            disabled={isPending}
            className={`${inputClass} resize-none`}
          />
        </div>

        <div className="sm:col-span-3">
          <label htmlFor="wi-notes" className={labelClass}>Notas internas</label>
          <textarea
            id="wi-notes"
            name="notes"
            rows={2}
            disabled={isPending}
            className={`${inputClass} resize-none`}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg border border-admin-border-strong px-4 py-2 text-sm text-admin-text-secondary transition-colors hover:border-admin-accent hover:text-admin-text disabled:opacity-50"
      >
        {isPending ? "Guardando..." : "Crear work item"}
      </button>
    </form>
  );
}
