"use client";

import { useTransition } from "react";
import { LEAD_STATUSES, type LeadStatus } from "@/features/leads/domain/lead.types";
import { updateLeadStatusAction } from "@/server/actions/admin-lead.action";

const LABELS: Record<LeadStatus, string> = {
  new:          "Nuevo",
  contacted:    "Contactado",
  qualified:    "Calificado",
  disqualified: "Descartado",
};

export function LeadStatusSelector({
  leadId,
  currentStatus,
}: {
  leadId: string;
  currentStatus: LeadStatus;
}) {
  const [isPending, startTransition] = useTransition();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const status = e.target.value as LeadStatus;
    startTransition(async () => {
      await updateLeadStatusAction(leadId, status);
    });
  }

  return (
    <select
      defaultValue={currentStatus}
      onChange={handleChange}
      disabled={isPending}
      className="rounded-lg border border-admin-border-strong bg-admin-bg px-3 py-2 text-sm text-admin-text focus:border-admin-accent focus:outline-none disabled:opacity-50"
    >
      {LEAD_STATUSES.map((s) => (
        <option key={s} value={s}>
          {LABELS[s]}
        </option>
      ))}
    </select>
  );
}
