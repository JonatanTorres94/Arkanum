"use client";

import { createContext, useContext, useState } from "react";
import { ProjectDetailsForm } from "@/components/admin/project-details-form";
import { AdminCard } from "@/components/admin/admin-card";
import type { ProjectStatus } from "@/features/projects/domain/project.types";
import type { ProjectWorkItem } from "@/features/projects/domain/project-work-item.types";

type ProjectValues = {
  projectId:   string;
  name:        string;
  description: string | null;
  status:      ProjectStatus;
  startDate:   string | null;
  targetDate:  string | null;
  notes:       string | null;
  workItems:   ProjectWorkItem[];
};

type ProjectWorkspaceContextValue = ProjectValues & {
  isEditing:    boolean;
  startEditing: () => void;
  stopEditing:  () => void;
};

const ProjectWorkspaceContext = createContext<ProjectWorkspaceContextValue | null>(null);

function useProjectWorkspace() {
  const context = useContext(ProjectWorkspaceContext);
  if (!context) {
    throw new Error(
      "EditProjectButton/ProjectDetailsSection must be used within ProjectWorkspaceProvider"
    );
  }
  return context;
}

export function ProjectWorkspaceProvider({
  children,
  ...values
}: ProjectValues & { children: React.ReactNode }) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <ProjectWorkspaceContext.Provider
      value={{
        ...values,
        isEditing,
        startEditing: () => setIsEditing(true),
        stopEditing:  () => setIsEditing(false),
      }}
    >
      {children}
    </ProjectWorkspaceContext.Provider>
  );
}

export function EditProjectButton() {
  const { isEditing, startEditing } = useProjectWorkspace();

  if (isEditing) return null;

  return (
    <button
      type="button"
      onClick={startEditing}
      className="rounded-lg border border-admin-border-strong px-4 py-2 text-sm text-admin-text-secondary transition-colors hover:border-admin-accent hover:text-admin-text"
    >
      Editar proyecto
    </button>
  );
}

export function ProjectDetailsSection() {
  const {
    projectId,
    name,
    description,
    status,
    startDate,
    targetDate,
    notes,
    workItems,
    isEditing,
    stopEditing,
  } = useProjectWorkspace();

  if (!isEditing) {
    return description ? (
      <div>
        <dt className="mb-0.5 text-xs text-admin-text-muted">Descripción</dt>
        <dd className="text-sm text-admin-text break-words">{description}</dd>
      </div>
    ) : (
      <p className="text-sm text-admin-text-faint">Sin descripción.</p>
    );
  }

  return (
    <AdminCard>
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-admin-text-faint">
        Editar proyecto
      </h2>
      <ProjectDetailsForm
        projectId={projectId}
        name={name}
        description={description}
        status={status}
        startDate={startDate}
        targetDate={targetDate}
        notes={notes}
        workItems={workItems}
        onCancel={stopEditing}
        onSaved={stopEditing}
      />
    </AdminCard>
  );
}
