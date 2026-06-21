"use client";

import { useState, useTransition } from "react";
import { updateLeadFollowUpAction } from "@/server/actions/admin-lead.action";

export function LeadFollowUpForm({
  leadId,
  nextAction,
  followUpDate,
}: {
  leadId: string;
  nextAction: string | null;
  followUpDate: string | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const nextActionValue   = (data.get("nextAction") as string) ?? "";
    const followUpDateValue = (data.get("followUpDate") as string) ?? "";

    setError(null);
    startTransition(async () => {
      const result = await updateLeadFollowUpAction(leadId, {
        nextAction: nextActionValue,
        followUpDate: followUpDateValue,
      });
      if (result?.error) setError(result.error);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {!nextAction && !followUpDate && (
        <p className="text-sm text-admin-text-faint">Sin próxima acción definida.</p>
      )}

      {error && (
        <p role="alert" className="text-xs text-admin-danger">
          {error}
        </p>
      )}

      <div>
        <label htmlFor="nextAction" className="mb-1.5 block text-sm font-medium text-admin-text-secondary">
          Próxima acción
        </label>
        <textarea
          id="nextAction"
          name="nextAction"
          rows={2}
          defaultValue={nextAction ?? ""}
          placeholder="Ej: Llamar para coordinar una reunión."
          disabled={isPending}
          className="w-full rounded-lg border border-admin-border-strong bg-admin-bg px-3 py-2 text-sm text-admin-text placeholder-admin-text-faint transition-colors focus:border-admin-accent focus:outline-none disabled:opacity-50 resize-none"
        />
      </div>

      <div>
        <label htmlFor="followUpDate" className="mb-1.5 block text-sm font-medium text-admin-text-secondary">
          Fecha de seguimiento
        </label>
        <input
          id="followUpDate"
          name="followUpDate"
          type="date"
          defaultValue={followUpDate ?? ""}
          disabled={isPending}
          className="rounded-lg border border-admin-border-strong bg-admin-bg px-3 py-2 text-sm text-admin-text transition-colors focus:border-admin-accent focus:outline-none disabled:opacity-50"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg border border-admin-border-strong px-4 py-2 text-sm text-admin-text-secondary transition-colors hover:border-admin-accent hover:text-admin-text disabled:opacity-50"
      >
        {isPending ? "Guardando..." : "Guardar seguimiento"}
      </button>
    </form>
  );
}
