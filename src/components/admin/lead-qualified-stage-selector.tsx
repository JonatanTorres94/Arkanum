"use client";

import { useTransition } from "react";
import { QUALIFIED_STAGES, type QualifiedStage } from "@/features/leads/domain/lead.types";
import { updateLeadQualifiedStageAction } from "@/server/actions/admin-lead.action";

const LABELS: Record<QualifiedStage, string> = {
  discovery_pending: "Discovery pendiente",
  proposal_pending:  "Propuesta pendiente",
  proposal_sent:     "Propuesta enviada",
  waiting_client:    "Esperando respuesta del cliente",
  accepted:          "Aceptado",
  rejected:          "Rechazado",
  project_started:   "Proyecto iniciado",
};

export function LeadQualifiedStageSelector({
  leadId,
  currentStage,
}: {
  leadId: string;
  currentStage: QualifiedStage | null;
}) {
  const [isPending, startTransition] = useTransition();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value;
    const stage = value === "" ? null : (value as QualifiedStage);
    startTransition(async () => {
      await updateLeadQualifiedStageAction(leadId, stage);
    });
  }

  return (
    <select
      defaultValue={currentStage ?? ""}
      onChange={handleChange}
      disabled={isPending}
      className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200 focus:border-cyan-400 focus:outline-none disabled:opacity-50"
    >
      <option value="">Sin etapa asignada</option>
      {QUALIFIED_STAGES.map((s) => (
        <option key={s} value={s}>
          {LABELS[s]}
        </option>
      ))}
    </select>
  );
}
