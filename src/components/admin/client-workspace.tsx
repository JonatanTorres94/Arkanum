"use client";

import { createContext, useContext, useState } from "react";
import { ClientDetailsForm } from "@/components/admin/client-details-form";
import { AdminCard } from "@/components/admin/admin-card";
import type { ClientStatus } from "@/features/clients/domain/client.types";

type ClientValues = {
  clientId:     string;
  name:         string;
  company:      string | null;
  contactName:  string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  industry:     string | null;
  status:       ClientStatus;
  notes:        string | null;
};

type ClientWorkspaceContextValue = ClientValues & {
  isEditing:    boolean;
  startEditing: () => void;
  stopEditing:  () => void;
};

const ClientWorkspaceContext = createContext<ClientWorkspaceContextValue | null>(null);

function useClientWorkspace() {
  const context = useContext(ClientWorkspaceContext);
  if (!context) {
    throw new Error(
      "EditClientButton/ClientDetailsSection must be used within ClientWorkspaceProvider"
    );
  }
  return context;
}

export function ClientWorkspaceProvider({
  children,
  ...values
}: ClientValues & { children: React.ReactNode }) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <ClientWorkspaceContext.Provider
      value={{
        ...values,
        isEditing,
        startEditing: () => setIsEditing(true),
        stopEditing:  () => setIsEditing(false),
      }}
    >
      {children}
    </ClientWorkspaceContext.Provider>
  );
}

export function EditClientButton() {
  const { isEditing, startEditing } = useClientWorkspace();

  if (isEditing) return null;

  return (
    <button
      type="button"
      onClick={startEditing}
      className="rounded-lg border border-admin-border-strong px-4 py-2 text-sm text-admin-text-secondary transition-colors hover:border-admin-accent hover:text-admin-text"
    >
      Editar cliente
    </button>
  );
}

export function ClientDetailsSection() {
  const {
    clientId, name, company, contactName, contactEmail,
    contactPhone, industry, status, notes,
    isEditing, stopEditing,
  } = useClientWorkspace();

  if (!isEditing) {
    return (
      <dl className="space-y-3">
        {company    && <SummaryField label="Empresa"  value={company} />}
        {industry   && <SummaryField label="Rubro"    value={industry} />}
        {notes      && <SummaryField label="Notas internas" value={notes} />}
        {!company && !industry && !notes && (
          <p className="text-sm text-admin-text-faint">Sin información adicional registrada.</p>
        )}
      </dl>
    );
  }

  return (
    <AdminCard>
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-admin-text-faint">
        Editar cliente
      </h2>
      <ClientDetailsForm
        clientId={clientId}
        name={name}
        company={company}
        contactName={contactName}
        contactEmail={contactEmail}
        contactPhone={contactPhone}
        industry={industry}
        status={status}
        notes={notes}
        onCancel={stopEditing}
        onSaved={stopEditing}
      />
    </AdminCard>
  );
}

function SummaryField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="mb-0.5 text-xs text-admin-text-muted">{label}</dt>
      <dd className="text-sm text-admin-text break-words">{value}</dd>
    </div>
  );
}
