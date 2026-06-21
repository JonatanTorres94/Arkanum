"use client";

import { useTransition } from "react";
import { TICKET_STATUSES, type TicketStatus } from "@/features/support/domain/support-ticket.types";
import { updateSupportTicketStatusAction } from "@/server/actions/admin-support-ticket.action";
import { adminFieldClass } from "@/components/admin/admin-field-styles";

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

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const status = e.target.value;
    startTransition(async () => {
      await updateSupportTicketStatusAction(ticketId, status);
    });
  }

  return (
    <select
      defaultValue={currentStatus}
      onChange={handleChange}
      disabled={isPending}
      className={`${adminFieldClass} cursor-pointer`}
    >
      {TICKET_STATUSES.map((status) => (
        <option key={status} value={status}>{LABELS[status]}</option>
      ))}
    </select>
  );
}
