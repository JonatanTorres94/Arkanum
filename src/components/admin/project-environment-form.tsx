"use client";

import { useRef, useState, useTransition } from "react";
import {
  ENVIRONMENT_TYPES,
  ENVIRONMENT_STATUSES,
  type EnvironmentType,
  type EnvironmentStatus,
} from "@/features/projects/domain/project-environment.types";
import { createProjectEnvironmentAction } from "@/server/actions/admin-project-metadata.action";

const TYPE_LABELS: Record<EnvironmentType, string> = {
  development: "Desarrollo",
  staging:     "Staging",
  production:  "Producción",
  demo:        "Demo",
  other:       "Otro",
};

const STATUS_LABELS: Record<EnvironmentStatus, string> = {
  active:   "Activo",
  inactive: "Inactivo",
  degraded: "Degradado",
};

const inputClass =
  "w-full rounded-lg border border-admin-border-strong bg-admin-bg px-3 py-2 text-sm text-admin-text placeholder-admin-text-faint transition-colors focus:border-admin-accent focus:outline-none disabled:opacity-50";

const labelClass = "mb-1.5 block text-xs font-medium text-admin-text-muted";

export function ProjectEnvironmentForm({ projectId }: { projectId: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError]           = useState<string | null>(null);
  const formRef                     = useRef<HTMLFormElement>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setError(null);

    startTransition(async () => {
      const result = await createProjectEnvironmentAction(projectId, {
        name:   (data.get("name") as string) ?? "",
        type:   (data.get("type") as string) ?? "",
        url:    (data.get("url") as string) ?? "",
        status: (data.get("status") as string) ?? "",
        notes:  (data.get("notes") as string) ?? "",
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

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="env-name" className={labelClass}>Nombre</label>
          <input
            id="env-name"
            name="name"
            type="text"
            required
            disabled={isPending}
            placeholder="Producción"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="env-type" className={labelClass}>Tipo</label>
          <select
            id="env-type"
            name="type"
            defaultValue="development"
            disabled={isPending}
            className={`${inputClass} cursor-pointer`}
          >
            {ENVIRONMENT_TYPES.map((type) => (
              <option key={type} value={type}>{TYPE_LABELS[type]}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="env-status" className={labelClass}>Estado</label>
          <select
            id="env-status"
            name="status"
            defaultValue="active"
            disabled={isPending}
            className={`${inputClass} cursor-pointer`}
          >
            {ENVIRONMENT_STATUSES.map((status) => (
              <option key={status} value={status}>{STATUS_LABELS[status]}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="env-url" className={labelClass}>URL</label>
          <input
            id="env-url"
            name="url"
            type="url"
            disabled={isPending}
            placeholder="https://app.arkanum.com"
            className={inputClass}
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="env-notes" className={labelClass}>Notas</label>
          <textarea
            id="env-notes"
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
        {isPending ? "Guardando..." : "Crear entorno"}
      </button>
    </form>
  );
}
