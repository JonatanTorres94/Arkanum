"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { escalateSupportTicketAction } from "@/server/actions/admin-support-ticket.action";

export function SupportTicketEscalationPanel({
  ticketId,
  projectId,
  escalatedWorkItemId,
  escalatedAt,
  escalatedBy,
}: {
  ticketId: string;
  projectId: string | null;
  escalatedWorkItemId: string | null;
  escalatedAt: string | null;
  escalatedBy: string | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError]           = useState<string | null>(null);

  if (escalatedWorkItemId) {
    return (
      <div className="space-y-1.5">
        <p className="text-sm text-emerald-400">Este ticket ya fue escalado a desarrollo.</p>
        <p className="text-xs text-slate-500">
          {escalatedBy ?? "Administrador"}
          {escalatedAt && ` · ${new Date(escalatedAt).toLocaleString("es-AR")}`}
        </p>
        {projectId && (
          <Link
            href={`/admin/projects/${projectId}`}
            className="inline-block text-xs text-cyan-400 transition-colors hover:text-cyan-300"
          >
            Ver work item en el proyecto →
          </Link>
        )}
      </div>
    );
  }

  if (!projectId) {
    return (
      <p className="text-sm text-slate-500">
        Este ticket no tiene un proyecto asociado. Para escalarlo a desarrollo, necesita estar
        vinculado a un proyecto.
      </p>
    );
  }

  function handleEscalate() {
    setError(null);
    startTransition(async () => {
      const result = await escalateSupportTicketAction(ticketId);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-400">
        Esto crea un work item en el proyecto asociado y marca el ticket como escalado a desarrollo.
      </p>
      {error && (
        <p role="alert" className="text-xs text-red-400">{error}</p>
      )}
      <button
        type="button"
        onClick={handleEscalate}
        disabled={isPending}
        className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition-colors hover:border-slate-500 hover:text-slate-100 disabled:opacity-50"
      >
        {isPending ? "Escalando..." : "Escalar a desarrollo"}
      </button>
    </div>
  );
}
