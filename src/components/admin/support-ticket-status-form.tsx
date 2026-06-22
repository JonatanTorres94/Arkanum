"use client";

import { useState, useTransition } from "react";
import { TICKET_STATUSES, type TicketStatus } from "@/features/support/domain/support-ticket.types";
import { updateSupportTicketStatusAction } from "@/server/actions/admin-support-ticket.action";

const LABELS: Record<TicketStatus, string> = {
  new:                      "Nuevo",
  triage:                   "Triage",
  waiting_client:           "Esperando cliente",
  waiting_internal:         "Esperando interno",
  escalated_to_development: "Escalado a desarrollo",
  resolved:                 "Resuelto",
  closed:                   "Cerrado",
  cancelled:                "Cancelado",
};

export function SupportTicketStatusForm({
  ticketId,
  currentStatus,
}: {
  ticketId: string;
  currentStatus: TicketStatus;
}) {
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const status = e.target.value;
    setFeedback(null);
    startTransition(async () => {
      const result = await updateSupportTicketStatusAction(ticketId, status);
      if (result.error) {
        e.target.value = currentStatus;
        setFeedback(result.error);
      } else if (result.warning) {
        setFeedback(result.warning);
      }
    });
  }

  return (
    <div>
      <select
        defaultValue={currentStatus}
        onChange={handleChange}
        disabled={isPending}
        className="rounded-lg border border-admin-border-strong bg-admin-bg px-3 py-2 text-sm text-admin-text focus:border-admin-accent focus:outline-none disabled:opacity-50"
      >
        {TICKET_STATUSES.map((status) => (
          <option key={status} value={status}>{LABELS[status]}</option>
        ))}
      </select>
      {feedback && (
        <p role="alert" className="mt-2 text-xs text-admin-danger">
          {feedback}
        </p>
      )}
    </div>
  );
}
