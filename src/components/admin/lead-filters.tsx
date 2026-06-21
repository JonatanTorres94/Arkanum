"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  LEAD_STATUSES,
  QUALIFIED_STAGES,
  type LeadStatus,
  type QualifiedStage,
} from "@/features/leads/domain/lead.types";
import {
  INDUSTRY_OPTIONS,
  COMPANY_SIZE_OPTIONS,
  BUDGET_OPTIONS,
  URGENCY_OPTIONS,
} from "@/features/leads/domain/lead.schema";

const STATUS_LABELS: Record<LeadStatus, string> = {
  new:          "Nuevo",
  contacted:    "Contactado",
  qualified:    "Calificado",
  disqualified: "Descartado",
};

const QUALIFIED_STAGE_LABELS: Record<QualifiedStage, string> = {
  discovery_pending: "Discovery pendiente",
  proposal_pending:  "Propuesta pendiente",
  proposal_sent:     "Propuesta enviada",
  waiting_client:    "Esperando respuesta del cliente",
  accepted:          "Aceptado",
  rejected:          "Rechazado",
  project_started:   "Proyecto iniciado",
};

const selectClass =
  "rounded-lg border border-admin-border-strong bg-admin-bg px-3 py-2 text-sm text-admin-text-secondary transition-colors focus:border-admin-accent focus:outline-none cursor-pointer";

export function LeadFilters() {
  const router = useRouter();
  const params = useSearchParams();

  function set(name: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(name, value);
    else next.delete(name);
    router.push(`/admin/leads?${next.toString()}`);
  }

  const val = (name: string) => params.get(name) ?? "";

  const hasFilters = [
    "status",
    "industry",
    "companySize",
    "budget",
    "urgency",
    "qualifiedStage",
  ].some((k) => params.get(k));

  return (
    <div className="flex flex-wrap items-center gap-3">
      <select className={selectClass} value={val("status")} onChange={(e) => set("status", e.target.value)}>
        <option value="">Estado</option>
        {LEAD_STATUSES.map((s) => (
          <option key={s} value={s}>{STATUS_LABELS[s]}</option>
        ))}
      </select>

      <select className={selectClass} value={val("budget")} onChange={(e) => set("budget", e.target.value)}>
        <option value="">Presupuesto</option>
        {BUDGET_OPTIONS.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>

      <select className={selectClass} value={val("urgency")} onChange={(e) => set("urgency", e.target.value)}>
        <option value="">Urgencia</option>
        {URGENCY_OPTIONS.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>

      <select className={selectClass} value={val("industry")} onChange={(e) => set("industry", e.target.value)}>
        <option value="">Rubro</option>
        {INDUSTRY_OPTIONS.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>

      <select className={selectClass} value={val("companySize")} onChange={(e) => set("companySize", e.target.value)}>
        <option value="">Tamaño</option>
        {COMPANY_SIZE_OPTIONS.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>

      <select
        className={selectClass}
        value={val("qualifiedStage")}
        onChange={(e) => set("qualifiedStage", e.target.value)}
      >
        <option value="">Etapa calificada</option>
        <option value="unassigned">Sin etapa asignada</option>
        {QUALIFIED_STAGES.map((s) => (
          <option key={s} value={s}>{QUALIFIED_STAGE_LABELS[s]}</option>
        ))}
      </select>

      {hasFilters && (
        <Link
          href="/admin/leads"
          className="text-xs text-admin-text-faint transition-colors hover:text-admin-text-secondary"
        >
          Limpiar filtros
        </Link>
      )}
    </div>
  );
}
