"use client";

import { useRef, useState, useTransition } from "react";
import { uploadSupportTicketAttachmentAction } from "@/server/actions/admin-support-ticket-attachment.action";

const ALLOWED_ACCEPT = [
  "image/jpeg","image/png","image/gif","image/webp",
  "application/pdf",
  "text/plain","text/csv",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/zip",
].join(",");

export function SupportTicketAttachmentUploadForm({ ticketId }: { ticketId: string }) {
  const [isPending, startTransition] = useTransition();
  const [error,   setError]          = useState<string | null>(null);
  const [warning, setWarning]        = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setWarning(null);

    const form     = e.currentTarget;
    const formData = new FormData(form);
    const file     = formData.get("file") as File | null;
    if (!file || file.size === 0) {
      setError("Seleccioná un archivo antes de subir.");
      return;
    }

    startTransition(async () => {
      const result = await uploadSupportTicketAttachmentAction(ticketId, formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      if (result.warning) setWarning(result.warning);
      form.reset();
    });
  }

  return (
    <div className="space-y-2">
      <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          name="file"
          accept={ALLOWED_ACCEPT}
          disabled={isPending}
          className="flex-1 min-w-0 rounded-lg border border-admin-border-strong bg-admin-bg px-3 py-1.5 text-sm text-admin-text file:mr-2 file:rounded file:border-0 file:bg-admin-surface file:px-2 file:py-0.5 file:text-xs file:text-admin-text disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isPending}
          className="shrink-0 rounded-lg bg-admin-accent px-3 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? "Subiendo…" : "Subir archivo"}
        </button>
      </form>
      <p className="text-xs text-admin-text-muted">
        Máx. 10 MB · Imágenes, PDF, documentos Office, ZIP, texto plano.
      </p>
      {error   && <p role="alert" className="text-xs text-admin-danger">{error}</p>}
      {warning && <p role="alert" className="text-xs text-amber-400">{warning}</p>}
    </div>
  );
}
