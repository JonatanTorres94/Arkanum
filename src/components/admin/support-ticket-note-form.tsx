"use client";

import { useRef, useState, useTransition } from "react";
import { createSupportTicketNoteAction } from "@/server/actions/support-ticket-note.action";

export function SupportTicketNoteForm({ ticketId }: { ticketId: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError]           = useState<string | null>(null);
  const formRef                     = useRef<HTMLFormElement>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const content = (new FormData(e.currentTarget).get("content") as string) ?? "";
    setError(null);

    startTransition(async () => {
      const result = await createSupportTicketNoteAction(ticketId, content);
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
        <p className="text-xs text-admin-danger">{error}</p>
      )}
      <textarea
        name="content"
        rows={3}
        placeholder="Agregar nota interna..."
        required
        disabled={isPending}
        className="w-full rounded-lg border border-admin-border-strong bg-admin-bg px-3 py-2 text-sm text-admin-text placeholder-admin-text-faint focus:border-admin-accent focus:outline-none disabled:opacity-50 resize-none"
      />
      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg border border-admin-border-strong px-4 py-2 text-sm text-admin-text-secondary transition-colors hover:border-admin-accent hover:text-admin-text disabled:opacity-50"
      >
        {isPending ? "Guardando..." : "Agregar nota"}
      </button>
    </form>
  );
}
