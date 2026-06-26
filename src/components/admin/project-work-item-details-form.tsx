"use client";

import { useState, useTransition } from "react";
import {
  WORK_ITEM_CATEGORIES,
  WORK_ITEM_SELECTABLE_STATUSES,
  WORK_ITEM_PRIORITIES,
  type WorkItemCategory,
  type WorkItemStatus,
  type WorkItemPriority,
} from "@/features/projects/domain/project-work-item.types";
import { updateProjectWorkItemAction } from "@/server/actions/admin-project-work-item.action";
import {
  WORK_ITEM_STATUS_LABELS,
  WORK_ITEM_PRIORITY_LABELS,
  WORK_ITEM_CATEGORY_LABELS,
} from "@/features/projects/domain/project-work-item-labels";

const fieldClass =
  "w-full min-w-0 rounded-lg border border-admin-border-strong bg-admin-bg px-3 py-2 text-sm text-admin-text placeholder-admin-text-faint transition-colors focus:border-admin-accent focus:outline-none disabled:opacity-50";
const labelClass = "mb-1.5 block text-sm font-medium text-admin-text-secondary";

export function ProjectWorkItemDetailsForm({
  projectId,
  workItemId,
  title,
  description,
  category,
  status,
  priority,
  notes,
  onCancel,
  onSaved,
}: {
  projectId:   string;
  workItemId:  string;
  title:       string;
  description: string | null;
  category:    WorkItemCategory;
  status:      WorkItemStatus;
  priority:    WorkItemPriority;
  notes:       string | null;
  onCancel:    () => void;
  onSaved:     (warning?: string) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError]            = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await updateProjectWorkItemAction(projectId, workItemId, {
        title:       (fd.get("title")       as string) ?? "",
        description: (fd.get("description") as string) ?? "",
        category:    (fd.get("category")    as string) ?? "",
        status:      (fd.get("status")      as string) ?? "",
        priority:    (fd.get("priority")    as string) ?? "",
        notes:       (fd.get("notes")       as string) ?? "",
      });

      if (result.error) {
        setError(result.error);
      } else {
        onSaved(result.warning);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="wi-title" className={labelClass}>
            Título <span className="text-admin-danger">*</span>
          </label>
          <input
            id="wi-title"
            name="title"
            type="text"
            required
            defaultValue={title}
            disabled={isPending}
            className={fieldClass}
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="wi-description" className={labelClass}>Descripción</label>
          <textarea
            id="wi-description"
            name="description"
            rows={3}
            defaultValue={description ?? ""}
            disabled={isPending}
            className={fieldClass}
          />
        </div>

        <div>
          <label htmlFor="wi-category" className={labelClass}>Categoría</label>
          <select
            id="wi-category"
            name="category"
            defaultValue={category}
            disabled={isPending}
            className={fieldClass}
          >
            {WORK_ITEM_CATEGORIES.map((c) => (
              <option key={c} value={c}>{WORK_ITEM_CATEGORY_LABELS[c]}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="wi-status" className={labelClass}>Estado</label>
          <select
            id="wi-status"
            name="status"
            defaultValue={status}
            disabled={isPending}
            className={fieldClass}
          >
            {/* Always include current status (may be awaiting_support) so the select renders correctly. */}
            {(status === "awaiting_support"
              ? (["awaiting_support", ...WORK_ITEM_SELECTABLE_STATUSES] as readonly string[])
              : WORK_ITEM_SELECTABLE_STATUSES
            ).map((s) => (
              <option key={s} value={s}>{WORK_ITEM_STATUS_LABELS[s as WorkItemStatus]}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="wi-priority" className={labelClass}>Prioridad</label>
          <select
            id="wi-priority"
            name="priority"
            defaultValue={priority}
            disabled={isPending}
            className={fieldClass}
          >
            {WORK_ITEM_PRIORITIES.map((p) => (
              <option key={p} value={p}>{WORK_ITEM_PRIORITY_LABELS[p]}</option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="wi-notes" className={labelClass}>Notas internas</label>
          <textarea
            id="wi-notes"
            name="notes"
            rows={3}
            defaultValue={notes ?? ""}
            disabled={isPending}
            className={fieldClass}
          />
        </div>
      </div>

      {error && <p className="text-sm text-admin-danger">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-admin-accent px-4 py-2 text-sm font-medium text-admin-accent-foreground transition-opacity disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent/40"
        >
          {isPending ? "Guardando…" : "Guardar cambios"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isPending}
          className="rounded-lg border border-admin-border-strong px-4 py-2 text-sm text-admin-text-secondary transition-colors hover:text-admin-text disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent/40"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
