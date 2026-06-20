"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { convertLeadToClientAction } from "@/server/actions/admin-lead.action";

const inputClass =
  "w-full rounded-lg border border-admin-border-strong bg-admin-bg px-3 py-2 text-sm text-admin-text placeholder-admin-text-faint transition-colors focus:border-admin-accent focus:outline-none disabled:opacity-50";

const labelClass = "mb-1.5 block text-xs font-medium text-admin-text-muted";

export function LeadConversionPanel({
  leadId,
  eligible,
  convertedToClient,
  convertedClientId,
  convertedProjectId,
  convertedAt,
  convertedBy,
}: {
  leadId: string;
  eligible: boolean;
  convertedToClient: boolean;
  convertedClientId: string | null;
  convertedProjectId: string | null;
  convertedAt: string | null;
  convertedBy: string | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError]           = useState<string | null>(null);
  const [createProject, setCreateProject] = useState(false);

  if (convertedToClient) {
    return (
      <div className="space-y-1.5">
        <p className="text-sm text-admin-success">Este lead ya fue convertido a cliente.</p>
        <p className="text-xs text-admin-text-faint">
          {convertedBy ?? "Administrador"}
          {convertedAt && ` · ${new Date(convertedAt).toLocaleString("es-AR")}`}
        </p>
        <div className="flex flex-wrap gap-3 pt-1">
          {convertedClientId && (
            <Link
              href={`/admin/clients/${convertedClientId}`}
              className="text-xs text-admin-accent transition-colors hover:underline"
            >
              Ver cliente →
            </Link>
          )}
          {convertedProjectId && (
            <Link
              href={`/admin/projects/${convertedProjectId}`}
              className="text-xs text-admin-accent transition-colors hover:underline"
            >
              Ver proyecto →
            </Link>
          )}
        </div>
      </div>
    );
  }

  if (!eligible) return null;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setError(null);

    startTransition(async () => {
      const result = await convertLeadToClientAction(leadId, {
        createProject,
        projectName:   (data.get("projectName") as string) ?? "",
        projectStatus: (data.get("projectStatus") as string) ?? "planning",
      });
      if (result?.error) setError(result.error);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-admin-text-muted">
        Esto crea un cliente nuevo a partir de los datos del lead. El lead sigue existiendo
        como historial comercial y queda marcado como convertido.
      </p>

      {error && (
        <p role="alert" className="text-xs text-admin-danger">{error}</p>
      )}

      <label className="flex items-center gap-2 text-sm text-admin-text-secondary">
        <input
          type="checkbox"
          checked={createProject}
          onChange={(e) => setCreateProject(e.target.checked)}
          disabled={isPending}
          className="h-4 w-4 rounded border-admin-border-strong bg-admin-surface-hover accent-admin-accent"
        />
        Crear un proyecto inicial también
      </label>

      {createProject && (
        <div className="grid gap-3 border-l-2 border-admin-border pl-4 sm:grid-cols-2">
          <div>
            <label htmlFor="projectName" className={labelClass}>
              Nombre del proyecto
            </label>
            <input
              id="projectName"
              name="projectName"
              type="text"
              disabled={isPending}
              placeholder="Se usa el proceso a mejorar si lo dejás vacío"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="projectStatus" className={labelClass}>
              Estado inicial
            </label>
            <select
              id="projectStatus"
              name="projectStatus"
              defaultValue="planning"
              disabled={isPending}
              className={`${inputClass} cursor-pointer`}
            >
              <option value="planning">Planificación</option>
              <option value="discovery">Discovery</option>
            </select>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-admin-accent px-6 py-2.5 text-sm font-semibold text-admin-accent-foreground transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "Convirtiendo..." : "Convertir a cliente"}
      </button>
    </form>
  );
}
