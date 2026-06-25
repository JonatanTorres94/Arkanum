"use client";

import { useState, useTransition } from "react";
import { PROJECT_STATUSES, type ProjectStatus } from "@/features/projects/domain/project.types";
import { OPEN_WORK_ITEM_STATUSES } from "@/features/projects/domain/project-lifecycle";
import type { ProjectWorkItem } from "@/features/projects/domain/project-work-item.types";
import { updateProjectAction } from "@/server/actions/admin-project.action";

const STATUS_LABELS: Record<ProjectStatus, string> = {
  discovery:      "Descubrimiento",
  planning:       "Planificación",
  in_development: "En desarrollo",
  testing:        "Testing",
  deployed:       "Deployado",
  maintenance:    "Mantenimiento",
  paused:         "Pausado",
  cancelled:      "Cancelado",
};

const fieldClass =
  "w-full min-w-0 rounded-lg border border-admin-border-strong bg-admin-bg px-3 py-2 text-sm text-admin-text placeholder-admin-text-faint transition-colors focus:border-admin-accent focus:outline-none disabled:opacity-50";
const labelClass = "mb-1.5 block text-sm font-medium text-admin-text-secondary";

const openSet = new Set<string>(OPEN_WORK_ITEM_STATUSES);

function countOpenItems(workItems: ProjectWorkItem[]): number {
  return workItems.filter((wi) => openSet.has(wi.status)).length;
}

export function ProjectDetailsForm({
  projectId,
  name,
  description,
  status,
  startDate,
  targetDate,
  notes,
  workItems,
  onCancel,
  onSaved,
}: {
  projectId:   string;
  name:        string;
  description: string | null;
  status:      ProjectStatus;
  startDate:   string | null;
  targetDate:  string | null;
  notes:       string | null;
  workItems:   ProjectWorkItem[];
  onCancel:    () => void;
  onSaved:     () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>(status);

  const openCount = countOpenItems(workItems);
  const showOpenWarning =
    (selectedStatus === "testing" || selectedStatus === "deployed") && openCount > 0;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await updateProjectAction(projectId, {
        name:        (fd.get("name")        as string) ?? "",
        description: (fd.get("description") as string) ?? "",
        status:      (fd.get("status")      as string) ?? "",
        startDate:   (fd.get("startDate")   as string) ?? "",
        targetDate:  (fd.get("targetDate")  as string) ?? "",
        notes:       (fd.get("notes")       as string) ?? "",
      });

      if (result.error) {
        setError(result.error);
      } else {
        onSaved();
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="proj-name" className={labelClass}>
          Nombre <span className="text-admin-danger">*</span>
        </label>
        <input
          id="proj-name"
          name="name"
          type="text"
          required
          defaultValue={name}
          disabled={isPending}
          className={fieldClass}
        />
      </div>

      <div>
        <label htmlFor="proj-description" className={labelClass}>
          Descripción
        </label>
        <textarea
          id="proj-description"
          name="description"
          rows={3}
          defaultValue={description ?? ""}
          disabled={isPending}
          className={fieldClass}
        />
      </div>

      <div>
        <label htmlFor="proj-status" className={labelClass}>
          Estado <span className="text-admin-danger">*</span>
        </label>
        <select
          id="proj-status"
          name="status"
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          disabled={isPending}
          className={fieldClass}
        >
          {PROJECT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
        {showOpenWarning && (
          <p className="mt-1.5 text-xs text-amber-400">
            {openCount} work item{openCount !== 1 ? "s" : ""} todavía{" "}
            {openCount !== 1 ? "están" : "está"} abierto{openCount !== 1 ? "s" : ""}.
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="proj-startDate" className={labelClass}>
            Fecha de inicio
          </label>
          <input
            id="proj-startDate"
            name="startDate"
            type="date"
            defaultValue={startDate ?? ""}
            disabled={isPending}
            className={fieldClass}
          />
        </div>
        <div>
          <label htmlFor="proj-targetDate" className={labelClass}>
            Fecha objetivo
          </label>
          <input
            id="proj-targetDate"
            name="targetDate"
            type="date"
            defaultValue={targetDate ?? ""}
            disabled={isPending}
            className={fieldClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor="proj-notes" className={labelClass}>
          Notas internas
        </label>
        <textarea
          id="proj-notes"
          name="notes"
          rows={3}
          defaultValue={notes ?? ""}
          disabled={isPending}
          className={fieldClass}
        />
      </div>

      {error && <p className="text-sm text-admin-danger">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isPending}
          className={`rounded-lg bg-admin-accent px-4 py-2 text-sm font-medium text-admin-accent-foreground transition-opacity disabled:opacity-50`}
        >
          {isPending ? "Guardando…" : "Guardar cambios"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isPending}
          className={`rounded-lg border border-admin-border-strong px-4 py-2 text-sm text-admin-text-secondary transition-colors hover:text-admin-text disabled:opacity-50`}
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
