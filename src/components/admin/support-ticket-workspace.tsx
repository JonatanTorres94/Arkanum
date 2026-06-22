"use client";

import { createContext, useContext, useState } from "react";
import { SupportTicketDetailsForm } from "@/components/admin/support-ticket-details-form";
import { AdminCard } from "@/components/admin/admin-card";
import type {
  TicketCategory,
  TicketPriority,
  TicketSource,
} from "@/features/support/domain/support-ticket.types";

type ProjectOption = { id: string; name: string };

type TicketValues = {
  ticketId: string;
  title: string;
  description: string | null;
  projectId: string | null;
  projects: ProjectOption[];
  reportedBy: string | null;
  source: TicketSource;
  category: TicketCategory;
  priority: TicketPriority;
  projectLocked: boolean;
};

type SupportTicketWorkspaceContextValue = TicketValues & {
  isEditing: boolean;
  startEditing: () => void;
  stopEditing: () => void;
};

const SupportTicketWorkspaceContext = createContext<SupportTicketWorkspaceContextValue | null>(null);

function useSupportTicketWorkspace() {
  const context = useContext(SupportTicketWorkspaceContext);
  if (!context) {
    throw new Error(
      "EditTicketButton/SupportTicketDetailsSection must be used within SupportTicketWorkspaceProvider"
    );
  }
  return context;
}

export function SupportTicketWorkspaceProvider({
  children,
  ...values
}: TicketValues & { children: React.ReactNode }) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <SupportTicketWorkspaceContext.Provider
      value={{
        ...values,
        isEditing,
        startEditing: () => setIsEditing(true),
        stopEditing: () => setIsEditing(false),
      }}
    >
      {children}
    </SupportTicketWorkspaceContext.Provider>
  );
}

export function EditTicketButton() {
  const { isEditing, startEditing } = useSupportTicketWorkspace();

  if (isEditing) return null;

  return (
    <button
      type="button"
      onClick={startEditing}
      className="rounded-lg border border-admin-border-strong px-4 py-2 text-sm text-admin-text-secondary transition-colors hover:border-admin-accent hover:text-admin-text"
    >
      Editar ticket
    </button>
  );
}

export function SupportTicketDetailsSection() {
  const {
    ticketId,
    title,
    description,
    projectId,
    projects,
    reportedBy,
    source,
    category,
    priority,
    projectLocked,
    isEditing,
    stopEditing,
  } = useSupportTicketWorkspace();

  if (!isEditing) {
    return (
      <div>
        <dt className="mb-0.5 text-xs text-admin-text-muted">Descripción</dt>
        <dd className="text-sm text-admin-text break-words">{description ?? "Sin descripción."}</dd>
      </div>
    );
  }

  return (
    <AdminCard>
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-admin-text-faint">
        Editar ticket
      </h2>
      <SupportTicketDetailsForm
        ticketId={ticketId}
        title={title}
        description={description}
        projectId={projectId}
        projects={projects}
        reportedBy={reportedBy}
        source={source}
        category={category}
        priority={priority}
        projectLocked={projectLocked}
        onCancel={stopEditing}
        onSaved={stopEditing}
      />
    </AdminCard>
  );
}
