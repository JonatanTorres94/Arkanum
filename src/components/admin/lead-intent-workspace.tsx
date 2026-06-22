"use client";

import { createContext, useContext, useState } from "react";
import { LeadIntentFieldsForm } from "@/components/admin/lead-intent-fields-form";
import { AdminCard } from "@/components/admin/admin-card";

type LeadIntentValues = {
  leadId: string;
  industry: string;
  companySize: string | null;
  urgency: string;
  budget: string;
};

type LeadIntentContextValue = LeadIntentValues & {
  isEditing: boolean;
  startEditing: () => void;
  stopEditing: () => void;
};

const LeadIntentContext = createContext<LeadIntentContextValue | null>(null);

function useLeadIntentContext() {
  const context = useContext(LeadIntentContext);
  if (!context) {
    throw new Error("LeadIntentSummary/LeadIntentEditor must be used within LeadIntentProvider");
  }
  return context;
}

export function LeadIntentProvider({
  children,
  ...values
}: LeadIntentValues & { children: React.ReactNode }) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <LeadIntentContext.Provider
      value={{
        ...values,
        isEditing,
        startEditing: () => setIsEditing(true),
        stopEditing: () => setIsEditing(false),
      }}
    >
      {children}
    </LeadIntentContext.Provider>
  );
}

function SummaryField({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <dt className="mb-0.5 text-xs text-admin-text-muted">{label}</dt>
      <dd className="text-sm text-admin-text break-words">{value || "Sin definir"}</dd>
    </div>
  );
}

export function LeadIntentSummary() {
  const { industry, companySize, urgency, budget, startEditing } = useLeadIntentContext();

  return (
    <div className="space-y-4">
      <dl className="space-y-3">
        <SummaryField label="Rubro" value={industry} />
        <SummaryField label="Tamaño de empresa" value={companySize} />
        <SummaryField label="Urgencia" value={urgency} />
        <SummaryField label="Presupuesto" value={budget} />
      </dl>

      <button
        type="button"
        onClick={startEditing}
        className="rounded-lg border border-admin-border-strong px-4 py-2 text-sm text-admin-text-secondary transition-colors hover:border-admin-accent hover:text-admin-text"
      >
        Editar intención
      </button>
    </div>
  );
}

export function LeadIntentEditor() {
  const { leadId, industry, companySize, urgency, budget, isEditing, stopEditing } =
    useLeadIntentContext();

  if (!isEditing) return null;

  return (
    <AdminCard>
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-admin-text-faint">
        Editar intención
      </h2>
      <LeadIntentFieldsForm
        leadId={leadId}
        industry={industry}
        companySize={companySize}
        urgency={urgency}
        budget={budget}
        onCancel={stopEditing}
        onSaved={stopEditing}
      />
    </AdminCard>
  );
}
