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
      className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200 focus:border-cyan-400 focus:outline-none disabled:opacity-50"
    >
      {LEAD_STATUSES.map((s) => (
        <option key={s} value={s}>
          {LABELS[s]}
        </option>
      ))}
    </select>
  );
}
