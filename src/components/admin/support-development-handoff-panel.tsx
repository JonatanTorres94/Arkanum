"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import type { SupportDevelopmentPhase } from "@/features/support/domain/support-development-phase";
import type { WorkItemStatus } from "@/features/projects/domain/project-work-item.types";
import type { TicketStatus } from "@/features/support/domain/support-ticket.types";
import type { ProjectWorkItemComment } from "@/features/projects/domain/project-work-item-comment.types";
import { WORK_ITEM_STATUS_LABELS } from "@/features/projects/domain/project-work-item-labels";
import {
  resolveAfterDevelopmentAction,
  returnToDevelopmentAction,
  closeTicketAfterDevelopmentCancellationAction,
} from "@/server/actions/admin-support-ticket.action";

const TERMINAL_TICKET_STATUSES = new Set<TicketStatus>(["resolved", "closed", "cancelled"]);

type LinkedWorkItem = {
  id:        string;
  title:     string;
  status:    WorkItemStatus;
  projectId: string;
};

export function SupportDevelopmentHandoffPanel({
  ticketId,
  ticketStatus,
  phase,
  workItem,
  missingWorkItemId,
  supportComments = [],
}: {
  ticketId:          string;
  ticketStatus:      TicketStatus;
  phase:             SupportDevelopmentPhase;
  workItem:          LinkedWorkItem | null;
  missingWorkItemId: string | null;
  supportComments?:  ProjectWorkItemComment[];
}) {
  const [isPending, startTransition] = useTransition();
  const [error,   setError]          = useState<string | null>(null);
  const [warning, setWarning]        = useState<string | null>(null);
  const [reason,  setReason]         = useState("");
  const [showReturnForm, setShowReturnForm] = useState(false);

  const isTerminal = TERMINAL_TICKET_STATUSES.has(ticketStatus);

  function handleResolve() {
    setError(null);
    setWarning(null);
    startTransition(async () => {
      const result = await resolveAfterDevelopmentAction(ticketId);
      if (result.error)   setError(result.error);
      if (result.warning) setWarning(result.warning);
    });
  }

  function handleClose() {
    setError(null);
    setWarning(null);
    startTransition(async () => {
      const result = await closeTicketAfterDevelopmentCancellationAction(ticketId);
      if (result.error)   setError(result.error);
      if (result.warning) setWarning(result.warning);
    });
  }

  function handleReturn() {
    setError(null);
    setWarning(null);
    startTransition(async () => {
      const result = await returnToDevelopmentAction(ticketId, reason);
      if (result.error) {
        setError(result.error);
      } else {
        if (result.warning) setWarning(result.warning);
        setShowReturnForm(false);
        setReason("");
      }
    });
  }

  // Integrity error: ticket references a work item that no longer exists.
  if (missingWorkItemId) {
    return (
      <div className="rounded-lg border border-red-400/20 bg-red-400/5 px-4 py-4">
        <p className="text-sm font-medium text-red-400">Referencia rota</p>
        <p className="mt-1 text-xs text-admin-text-muted">
          El ticket referencia un work item que ya no está disponible. Revisá la vinculación.
        </p>
      </div>
    );
  }

  if (phase === "not_escalated" || !workItem) return null;

  const containerClass = isTerminal
    ? "border-admin-border bg-admin-surface-hover"
    : phase === "pending_support_validation"
    ? "border-emerald-400/20 bg-emerald-400/5"
    : phase === "development_cancelled"
    ? "border-amber-400/20 bg-amber-400/5"
    : "border-admin-border bg-admin-surface-hover";

  return (
    <div className={`rounded-lg border px-4 py-4 space-y-3 ${containerClass}`}>

      {/* Phase header — adapts to ticket status */}
      {ticketStatus === "resolved" ? (
        <>
          <p className="text-sm font-medium text-admin-text">Validación completada</p>
          <p className="text-xs text-admin-text-muted">
            Este ticket ya fue resuelto tras la validación del trabajo de desarrollo.
          </p>
        </>
      ) : (ticketStatus === "closed" || ticketStatus === "cancelled") ? (
        <>
          <p className="text-sm font-medium text-admin-text-muted">Historial de desarrollo</p>
          <p className="text-xs text-admin-text-muted">
            El ticket está cerrado o cancelado. El vínculo con desarrollo se conserva como referencia.
          </p>
        </>
      ) : (
        <>
          {phase === "development_in_progress" && (
            <>
              <p className="text-sm font-medium text-admin-text">Desarrollo en curso</p>
              <p className="text-xs text-admin-text-muted">
                El work item vinculado todavía tiene trabajo pendiente.
              </p>
            </>
          )}
          {phase === "pending_support_validation" && (
            <>
              <p className="text-sm font-medium text-emerald-400">Pendiente de validación de soporte</p>
              <p className="text-xs text-admin-text-muted">
                Desarrollo marcó el trabajo como completado. Validá el resultado antes de resolver el ticket.
              </p>
            </>
          )}
          {phase === "development_cancelled" && (
            <>
              <p className="text-sm font-medium text-amber-400">Desarrollo canceló el trabajo vinculado</p>
              <p className="text-xs text-admin-text-muted">
                Revisá el caso antes de cerrar, reasignar o devolverlo a desarrollo.
              </p>
            </>
          )}
        </>
      )}

      {/* Work item detail — always visible for context */}
      <div className="rounded-lg border border-admin-border bg-admin-surface px-3 py-2.5 space-y-1">
        <p className="text-xs text-admin-text-muted">Work item vinculado</p>
        <p className="text-sm text-admin-text break-words">{workItem.title}</p>
        <p className="text-xs text-admin-text-muted">{WORK_ITEM_STATUS_LABELS[workItem.status]}</p>
        <div className="flex flex-wrap gap-3 pt-0.5">
          <Link
            href={`/admin/projects/${workItem.projectId}`}
            className="text-xs text-admin-accent hover:underline"
          >
            Ver proyecto →
          </Link>
          <Link
            href={`/admin/projects/${workItem.projectId}/work-items/${workItem.id}`}
            className="text-xs text-admin-accent hover:underline"
          >
            Ver detalle →
          </Link>
        </div>
      </div>



      {/* Development comments visible to support */}
      {supportComments.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-admin-text-muted">Comentarios de Desarrollo</p>
          <ul className="space-y-2">
            {supportComments.map((c) => (
              <li
                key={c.id}
                className="rounded-lg border border-admin-border bg-admin-surface px-3 py-2 space-y-1"
              >
                <p className="text-sm text-admin-text whitespace-pre-wrap break-words">{c.content}</p>
                <p className="text-xs text-admin-text-muted">
                  {c.createdBy ?? "Desarrollo"}
                  {" · "}
                  {new Date(c.createdAt).toLocaleString("es-AR")}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Feedback */}
      {error   && <p className="text-xs text-admin-danger">{error}</p>}
      {warning && <p className="text-xs text-amber-400">{warning}</p>}

      {/* Actions — only when ticket is still eligible */}
      {!isTerminal && !showReturnForm && (
        <>
          {phase === "pending_support_validation" && (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleResolve}
                disabled={isPending}
                className="rounded-lg bg-admin-accent px-3 py-1.5 text-xs font-medium text-admin-accent-foreground transition-opacity disabled:opacity-50"
              >
                {isPending ? "Procesando…" : "Resolver ticket"}
              </button>
              <button
                type="button"
                onClick={() => setShowReturnForm(true)}
                disabled={isPending}
                className="rounded-lg border border-admin-border-strong px-3 py-1.5 text-xs text-admin-text-secondary transition-colors hover:text-admin-text disabled:opacity-50"
              >
                Devolver a desarrollo
              </button>
            </div>
          )}

          {phase === "development_cancelled" && (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleClose}
                disabled={isPending}
                className="rounded-lg bg-admin-accent px-3 py-1.5 text-xs font-medium text-admin-accent-foreground transition-opacity disabled:opacity-50"
              >
                {isPending ? "Procesando…" : "Cerrar ticket"}
              </button>
              <button
                type="button"
                onClick={() => setShowReturnForm(true)}
                disabled={isPending}
                className="rounded-lg border border-admin-border-strong px-3 py-1.5 text-xs text-admin-text-secondary transition-colors hover:text-admin-text disabled:opacity-50"
              >
                Devolver a desarrollo
              </button>
            </div>
          )}
        </>
      )}

      {/* Return-to-development inline form */}
      {!isTerminal && showReturnForm && (
        <div className="space-y-2">
          <label className="block text-xs text-admin-text-muted">
            Motivo de devolución (opcional)
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            maxLength={1000}
            rows={3}
            disabled={isPending}
            placeholder="Describí brevemente qué falta o qué cambió…"
            className="w-full rounded-lg border border-admin-border-strong bg-admin-bg px-3 py-2 text-sm text-admin-text placeholder-admin-text-faint focus:border-admin-accent focus:outline-none disabled:opacity-50"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleReturn}
              disabled={isPending}
              className="rounded-lg bg-admin-accent px-3 py-1.5 text-xs font-medium text-admin-accent-foreground transition-opacity disabled:opacity-50"
            >
              {isPending ? "Procesando…" : "Confirmar devolución"}
            </button>
            <button
              type="button"
              onClick={() => { setShowReturnForm(false); setReason(""); }}
              disabled={isPending}
              className="rounded-lg border border-admin-border-strong px-3 py-1.5 text-xs text-admin-text-secondary disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
