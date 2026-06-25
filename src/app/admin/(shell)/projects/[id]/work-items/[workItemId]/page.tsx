import Link from "next/link";
import { notFound } from "next/navigation";
import { getProjectByIdUseCase } from "@/features/projects/application/get-project-by-id.use-case";
import { SupabaseProjectRepository } from "@/features/projects/infrastructure/supabase-project.repository";
import { getProjectWorkItemByIdUseCase } from "@/features/projects/application/get-project-work-item-by-id.use-case";
import { SupabaseProjectWorkItemRepository } from "@/features/projects/infrastructure/supabase-project-work-item.repository";
import { getSupportTicketByWorkItemUseCase } from "@/features/support/application/get-support-ticket-by-work-item.use-case";
import { SupabaseSupportTicketRepository } from "@/features/support/infrastructure/supabase-support-ticket.repository";
import { AdminSection } from "@/components/admin/admin-card";
import { AdminDetailLayout } from "@/components/admin/admin-detail-layout";
import { ProjectStatusBadge } from "@/components/admin/project-status-badge";
import { WorkItemStatusBadge, WorkItemPriorityBadge } from "@/components/admin/project-work-item-badges";
import { TicketStatusBadge } from "@/components/admin/support-ticket-badges";
import {
  ProjectWorkItemWorkspaceProvider,
  EditWorkItemButton,
  WorkItemDetailsSection,
} from "@/components/admin/project-work-item-workspace";

export const metadata = { title: "Work item — Admin", robots: { index: false, follow: false } };

const CATEGORY_LABELS: Record<string, string> = {
  feature:            "Feature",
  bug:                "Bug",
  task:               "Tarea",
  improvement:        "Mejora",
  technical_debt:     "Deuda técnica",
  research:           "Investigación",
  support_escalation: "Escalación de soporte",
};

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div>
      <dt className="mb-0.5 text-xs text-admin-text-muted">{label}</dt>
      <dd className="text-sm text-admin-text break-words">{value}</dd>
    </div>
  );
}

export default async function AdminWorkItemDetailPage({
  params,
}: {
  params: Promise<{ id: string; workItemId: string }>;
}) {
  const { id: projectId, workItemId } = await params;

  const [workItemResult, projectResult] = await Promise.all([
    getProjectWorkItemByIdUseCase(workItemId, new SupabaseProjectWorkItemRepository()),
    getProjectByIdUseCase(projectId, new SupabaseProjectRepository()),
  ]);

  if (!workItemResult.ok || !projectResult.ok) notFound();

  const { workItem } = workItemResult;
  const { project }  = projectResult;

  // Ownership guard: route projectId must match the persisted work item.
  if (workItem.projectId !== projectId) notFound();

  const linkedTicketResult = await getSupportTicketByWorkItemUseCase(
    workItemId,
    new SupabaseSupportTicketRepository()
  );
  const linkedTicket = linkedTicketResult.ok ? linkedTicketResult.ticket : null;

  return (
    <ProjectWorkItemWorkspaceProvider
      projectId={projectId}
      workItemId={workItemId}
      title={workItem.title}
      description={workItem.description}
      category={workItem.category}
      status={workItem.status}
      priority={workItem.priority}
      notes={workItem.notes}
    >
      <AdminDetailLayout
        header={
          <div className="border-b border-admin-border px-6 py-5">
            <Link
              href={`/admin/projects/${projectId}`}
              className="mb-3 inline-block text-sm text-admin-text-muted transition-colors hover:text-admin-text"
            >
              ← {project.name}
            </Link>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="text-xl font-semibold text-admin-text break-words">{workItem.title}</h1>
                <p className="mt-1 text-xs text-admin-text-muted">
                  {CATEGORY_LABELS[workItem.category] ?? workItem.category}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <WorkItemPriorityBadge priority={workItem.priority} />
                <WorkItemStatusBadge   status={workItem.status} />
                <EditWorkItemButton />
              </div>
            </div>
          </div>
        }
        main={
          <>
            <AdminSection title="Detalle">
              <WorkItemDetailsSection />
            </AdminSection>
          </>
        }
        sidebar={
          <>
            {/* Proyecto padre */}
            <AdminSection title="Proyecto">
              <div className="space-y-2">
                <Link
                  href={`/admin/projects/${project.id}`}
                  className="block text-sm font-medium text-admin-text hover:text-admin-accent break-words"
                >
                  {project.name}
                </Link>
                <ProjectStatusBadge status={project.status} />
              </div>
            </AdminSection>

            {/* Ticket de soporte vinculado */}
            {linkedTicket && (
              <AdminSection title="Ticket vinculado">
                <div className="space-y-2">
                  <Link
                    href={`/admin/support/${linkedTicket.id}`}
                    className="block text-sm font-medium text-admin-text hover:text-admin-accent break-words"
                  >
                    {linkedTicket.title}
                  </Link>
                  <TicketStatusBadge status={linkedTicket.status} />
                  <Link
                    href={`/admin/support/${linkedTicket.id}`}
                    className="inline-block text-xs text-admin-accent transition-colors hover:underline"
                  >
                    Ver ticket →
                  </Link>
                </div>
              </AdminSection>
            )}

            {/* Metadata */}
            <AdminSection title="Metadata">
              <dl className="space-y-3">
                <Field label="Creado"      value={new Date(workItem.createdAt).toLocaleString("es-AR")} />
                <Field label="Actualizado" value={new Date(workItem.updatedAt).toLocaleString("es-AR")} />
              </dl>
            </AdminSection>
          </>
        }
      />
    </ProjectWorkItemWorkspaceProvider>
  );
}
