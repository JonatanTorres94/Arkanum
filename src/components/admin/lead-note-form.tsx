"use client";

import { useRef, useState, useTransition } from "react";
import { createLeadNoteAction } from "@/server/actions/lead-note.action";

export function LeadNoteForm({ leadId }: { leadId: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError]           = useState<string | null>(null);
  const formRef                     = useRef<HTMLFormElement>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const content = (new FormData(e.currentTarget).get("content") as string) ?? "";
    setError(null);

    startTransition(async () => {
      const result = await createLeadNoteAction(leadId, content);
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
        <p className="text-xs text-red-400">{error}</p>
      )}
      <textarea
        name="content"
        rows={3}
        placeholder="Agregar nota interna..."
        required
        disabled={isPending}
        className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:border-cyan-400 focus:outline-none disabled:opacity-50 resize-none"
      />
      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition-colors hover:border-slate-500 hover:text-slate-100 disabled:opacity-50"
      >
        {isPending ? "Guardando..." : "Agregar nota"}
      </button>
    </form>
  );
}
