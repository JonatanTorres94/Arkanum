"use client";

import { useState, useTransition } from "react";
import {
  INDUSTRY_OPTIONS,
  COMPANY_SIZE_OPTIONS,
  URGENCY_OPTIONS,
  BUDGET_OPTIONS,
} from "@/features/leads/domain/lead.schema";
import { updateLeadIntentFieldsAction } from "@/server/actions/admin-lead.action";

const selectClass =
  "w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 transition-colors focus:border-cyan-400 focus:outline-none disabled:opacity-50 cursor-pointer";

const labelClass = "mb-1.5 block text-sm font-medium text-slate-300";

export function LeadIntentFieldsForm({
  leadId,
  industry,
  companySize,
  urgency,
  budget,
}: {
  leadId: string;
  industry: string;
  companySize: string | null;
  urgency: string;
  budget: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);

    setError(null);
    startTransition(async () => {
      const result = await updateLeadIntentFieldsAction(leadId, {
        industry:    (data.get("industry") as string) ?? "",
        companySize: (data.get("companySize") as string) ?? "",
        urgency:     (data.get("urgency") as string) ?? "",
        budget:      (data.get("budget") as string) ?? "",
      });
      if (result?.error) setError(result.error);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <p role="alert" className="text-xs text-red-400">
          {error}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="industry" className={labelClass}>
            Rubro
          </label>
          <select
            id="industry"
            name="industry"
            defaultValue={industry}
            disabled={isPending}
            className={selectClass}
          >
            {INDUSTRY_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="companySize" className={labelClass}>
            Tamaño de empresa
          </label>
          <select
            id="companySize"
            name="companySize"
            defaultValue={companySize ?? ""}
            disabled={isPending}
            className={selectClass}
          >
            <option value="" disabled>
              Seleccionar tamaño
            </option>
            {COMPANY_SIZE_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="urgency" className={labelClass}>
            Urgencia
          </label>
          <select
            id="urgency"
            name="urgency"
            defaultValue={urgency}
            disabled={isPending}
            className={selectClass}
          >
            {URGENCY_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="budget" className={labelClass}>
            Presupuesto
          </label>
          <select
            id="budget"
            name="budget"
            defaultValue={budget}
            disabled={isPending}
            className={selectClass}
          >
            {BUDGET_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition-colors hover:border-slate-500 hover:text-slate-100 disabled:opacity-50"
      >
        {isPending ? "Guardando..." : "Guardar cambios"}
      </button>
    </form>
  );
}
