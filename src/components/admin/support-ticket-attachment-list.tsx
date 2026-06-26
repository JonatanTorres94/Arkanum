"use client";

import { useState, useTransition } from "react";
import type { SupportTicketAttachment } from "@/features/support/domain/support-ticket-attachment.types";
import {
  getSupportTicketAttachmentUrlAction,
  deleteSupportTicketAttachmentAction,
} from "@/server/actions/admin-support-ticket-attachment.action";

function formatBytes(bytes: number): string {
  if (bytes < 1024)       return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function AttachmentRow({
  attachment,
  ticketId,
  readOnly,
}: {
  attachment: SupportTicketAttachment;
  ticketId:   string;
  readOnly:   boolean;
}) {
  const [isPending,  startTransition] = useTransition();
  const [error,      setError]        = useState<string | null>(null);
  const [warning,    setWarning]      = useState<string | null>(null);
  const [confirming, setConfirming]   = useState(false);

  function handleDownload() {
    setError(null);
    startTransition(async () => {
      const result = await getSupportTicketAttachmentUrlAction(ticketId, attachment.id);
      if (result.error) { setError(result.error); return; }
      if (result.url) window.open(result.url, "_blank", "noopener,noreferrer");
    });
  }

  function handleDelete() {
    setError(null);
    setWarning(null);
    startTransition(async () => {
      const result = await deleteSupportTicketAttachmentAction(ticketId, attachment.id);
      if (result.error)   setError(result.error);
      if (result.warning) setWarning(result.warning);
      setConfirming(false);
    });
  }

  return (
    <li className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-admin-border bg-admin-surface px-3 py-2.5">
      <div className="min-w-0 flex-1 space-y-0.5">
        <p className="text-sm text-admin-text break-all">{attachment.filename}</p>
        <p className="text-xs text-admin-text-muted">
          {formatBytes(attachment.sizeBytes)}
          {" · "}
          {new Date(attachment.createdAt).toLocaleString("es-AR")}
          {attachment.uploadedBy && ` · ${attachment.uploadedBy}`}
        </p>
        {error   && <p role="alert" className="text-xs text-admin-danger">{error}</p>}
        {warning && <p role="alert" className="text-xs text-amber-400">{warning}</p>}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={handleDownload}
          disabled={isPending}
          className="text-xs text-admin-accent hover:underline disabled:opacity-50"
        >
          {isPending ? "…" : "Descargar"}
        </button>
        {!readOnly && !confirming && (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            disabled={isPending}
            className="text-xs text-admin-danger hover:underline disabled:opacity-50"
          >
            Eliminar
          </button>
        )}
        {!readOnly && confirming && (
          <span className="flex items-center gap-1.5 text-xs">
            <span className="text-admin-text-muted">¿Confirmar?</span>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isPending}
              className="text-admin-danger hover:underline disabled:opacity-50"
            >
              Sí
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              disabled={isPending}
              className="text-admin-text-muted hover:underline disabled:opacity-50"
            >
              No
            </button>
          </span>
        )}
      </div>
    </li>
  );
}

export function SupportTicketAttachmentList({
  attachments,
  ticketId,
  readOnly = false,
}: {
  attachments: SupportTicketAttachment[];
  ticketId:    string;
  readOnly?:   boolean;
}) {
  if (attachments.length === 0) {
    return (
      <p className="text-sm text-admin-text-muted">Sin adjuntos.</p>
    );
  }

  return (
    <ul className="space-y-2">
      {attachments.map((a) => (
        <AttachmentRow
          key={a.id}
          attachment={a}
          ticketId={ticketId}
          readOnly={readOnly}
        />
      ))}
    </ul>
  );
}
