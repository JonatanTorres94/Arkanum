"use client";

import { useRef, useState, useTransition } from "react";
import { COMMENT_MAX_LENGTH } from "@/features/projects/domain/project-work-item-comment.types";
import { requestSupportInterventionAction } from "@/server/actions/admin-project-work-item.action";
import type { WorkItemStatus } from "@/features/projects/domain/project-work-item.types";

// Statuses from which intervention cannot be requested.
const INELIGIBLE: Set<WorkItemStatus> = new Set(["awaiting_support", "done", "cancelled"]);

export function SupportInterventionRequestPanel({
  projectId,
  workItemId,
  currentStatus,
  linkedTicketId,
}: {
  projectId:      string;
  workItemId:     string;
  currentStatus:  WorkItemStatus;
  linkedTicketId: string | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [error,   setError]          = useState<string | null>(null);
  const [warning, setWarning]        = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // When there's no linked ticket, this panel has nothing to show.
  if (!linkedTicketId) return null;

  // When the WI is already awaiting support, show a read-only indicator.
  if (currentStatus === "awaiting_support") {
    return (
      <div className="rounded-lg border border-orange-400/20 bg-orange-400/5 px-4 py-4 space-y-1">
        <p className="text-sm font-medium text-orange-400">Esperando respuesta de Soporte</p>
        <p className="text-xs text-admin-text-muted">
          La solicitud de intervención fue enviada. Soporte recibirá el aviso en el ticket vinculado.
        </p>
      </div>
    );
  }

  // For terminal statuses (done/cancelled), the panel is irrelevant.
  if (INELIGIBLE.has(currentStatus)) return null;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setWarning(null);
    const comment = textareaRef.current?.value ?? "";

    startTransition(async () => {
      const result = await requestSupportInterventionAction(projectId, workItemId, comment);
      if (result.error) {
        setError(result.error);
        return;
      }
      if (result.warning) setWarning(result.warning);
      if (textareaRef.current) textareaRef.current.value = "";
    });
  }

  return (
    <div className="rounded-lg border border-admin-border bg-admin-surface-hover px-4 py-4 space-y-3">
      <div>
        <p className="text-sm font-medium text-admin-text">Solicitar intervención a Soporte</p>
        <p className="mt-0.5 text-xs text-admin-text-muted">
          El work item pasará a &quot;Esperando a Soporte&quot; y el ticket recibirá una alerta de acción requerida.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-2">
        <textarea
          ref={textareaRef}
          name="comment"
          required
          rows={3}
          maxLength={COMMENT_MAX_LENGTH}
          placeholder="Describí el bloqueo o lo que necesitás de Soporte…"
          disabled={isPending}
          className="w-full rounded-lg border border-admin-border-strong bg-admin-bg px-3 py-2 text-sm text-admin-text placeholder:text-admin-text-muted focus:border-admin-accent focus:outline-none disabled:opacity-50 resize-none"
        />
        <div className="flex items-center justify-end">
          <button
            type="submit"
            disabled={isPending}
            className="rounded-lg bg-admin-accent px-3 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isPending ? "Enviando…" : "Solicitar intervención"}
          </button>
        </div>
      </form>
      {error   && <p role="alert" className="text-xs text-admin-danger">{error}</p>}
      {warning && <p role="alert" className="text-xs text-amber-400">{warning}</p>}
    </div>
  );
}
