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
  const [error,   setError]   = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

  if (escalatedWorkItemId) {
    return (
      <div className="space-y-1.5">
        <p className="text-sm text-admin-success">Este ticket ya fue escalado a desarrollo.</p>
        <p className="text-xs text-admin-text-faint">
          {escalatedBy ?? "Administrador"}
          {escalatedAt && ` · ${new Date(escalatedAt).toLocaleString("es-AR")}`}
        </p>
        {projectId && (
          <Link
            href={`/admin/projects/${projectId}`}
            className="inline-block text-xs text-admin-accent transition-colors hover:underline"
          >
            Ver work item en el proyecto →
          </Link>
        )}
      </div>
    );
  }

  if (!projectId) {
    return (
      <p className="text-sm text-admin-text-faint">
        Este ticket no tiene un proyecto asociado. Para escalarlo a desarrollo, necesita estar
        vinculado a un proyecto.
      </p>
    );
  }

  function handleEscalate() {
    setError(null);
    setWarning(null);
    startTransition(async () => {
      const result = await escalateSupportTicketAction(ticketId);
      if (result?.error)   setError(result.error);
      if (result?.warning) setWarning(result.warning);
    });
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-admin-text-muted">
        Esto crea un work item en el proyecto asociado y marca el ticket como escalado a desarrollo.
      </p>
      {error   && <p role="alert" className="text-xs text-admin-danger">{error}</p>}
      {warning && <p role="alert" className="text-xs text-amber-400">{warning}</p>}
      <button
        type="button"
        onClick={handleEscalate}
        disabled={isPending}
        className="rounded-lg border border-admin-border-strong px-4 py-2 text-sm text-admin-text-secondary transition-colors hover:border-admin-accent hover:text-admin-text disabled:opacity-50"
      >
        {isPending ? "Escalando..." : "Escalar a desarrollo"}
      </button>
    </div>
  );
}
