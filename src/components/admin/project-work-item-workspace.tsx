"use client";

import { createContext, useContext, useState } from "react";
import { ProjectWorkItemDetailsForm } from "@/components/admin/project-work-item-details-form";
import { AdminCard } from "@/components/admin/admin-card";
import type { WorkItemCategory, WorkItemStatus, WorkItemPriority } from "@/features/projects/domain/project-work-item.types";

type WorkItemValues = {
  projectId:   string;
  workItemId:  string;
  title:       string;
  description: string | null;
  category:    WorkItemCategory;
  status:      WorkItemStatus;
  priority:    WorkItemPriority;
  notes:       string | null;
};

type WorkItemWorkspaceContextValue = WorkItemValues & {
  isEditing:    boolean;
  warning:      string | null;
  startEditing: () => void;
  stopEditing:  (warning?: string) => void;
};

const WorkItemWorkspaceContext = createContext<WorkItemWorkspaceContextValue | null>(null);

function useWorkItemWorkspace() {
  const context = useContext(WorkItemWorkspaceContext);
  if (!context) {
    throw new Error(
      "EditWorkItemButton/WorkItemDetailsSection must be used within ProjectWorkItemWorkspaceProvider"
    );
  }
  return context;
}

export function ProjectWorkItemWorkspaceProvider({
  children,
  ...values
}: WorkItemValues & { children: React.ReactNode }) {
  const [isEditing, setIsEditing] = useState(false);
  const [warning, setWarning]     = useState<string | null>(null);

  return (
    <WorkItemWorkspaceContext.Provider
      value={{
        ...values,
        isEditing,
        warning,
        startEditing: () => {
          setWarning(null);
          setIsEditing(true);
        },
        stopEditing: (w) => {
          setWarning(w ?? null);
          setIsEditing(false);
        },
      }}
    >
      {children}
    </WorkItemWorkspaceContext.Provider>
  );
}

export function EditWorkItemButton() {
  const { isEditing, startEditing } = useWorkItemWorkspace();

  if (isEditing) return null;

  return (
    <button
      type="button"
      onClick={startEditing}
      className="rounded-lg border border-admin-border-strong px-4 py-2 text-sm text-admin-text-secondary transition-colors hover:border-admin-accent hover:text-admin-text"
    >
      Editar work item
    </button>
  );
}

export function WorkItemDetailsSection() {
  const {
    projectId, workItemId, title, description,
    category, status, priority, notes,
    isEditing, warning, stopEditing,
  } = useWorkItemWorkspace();

  if (!isEditing) {
    return (
      <div className="space-y-3">
        {warning && (
          <p className="rounded-lg border border-amber-400/20 bg-amber-400/5 px-3 py-2.5 text-sm text-amber-400">
            {warning}
          </p>
        )}
        {description ? (
          <p className="text-sm text-admin-text break-words">{description}</p>
        ) : (
          <p className="text-sm text-admin-text-faint">Sin descripción.</p>
        )}
        {notes && (
          <div>
            <p className="mb-0.5 text-xs text-admin-text-muted">Notas internas</p>
            <p className="text-sm text-admin-text break-words">{notes}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <AdminCard>
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-admin-text-faint">
        Editar work item
      </h2>
      <ProjectWorkItemDetailsForm
        projectId={projectId}
        workItemId={workItemId}
        title={title}
        description={description}
        category={category}
        status={status}
        priority={priority}
        notes={notes}
        onCancel={() => stopEditing()}
        onSaved={(w) => stopEditing(w)}
      />
    </AdminCard>
  );
}
