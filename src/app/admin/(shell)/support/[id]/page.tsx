import Link from "next/link";
import { notFound } from "next/navigation";
import { getSupportTicketByIdUseCase } from "@/features/support/application/get-support-ticket-by-id.use-case";
import { getSupportTicketNotesUseCase } from "@/features/support/application/get-support-ticket-notes.use-case";
import { SupabaseSupportTicketRepository } from "@/features/support/infrastructure/supabase-support-ticket.repository";
import { SupabaseSupportTicketNoteRepository } from "@/features/support/infrastructure/supabase-support-ticket-note.repository";
import { getClientByIdUseCase } from "@/features/clients/application/get-client-by-id.use-case";
import { SupabaseClientRepository } from "@/features/clients/infrastructure/supabase-client.repository";
import { getProjectByIdUseCase } from "@/features/projects/application/get-project-by-id.use-case";
import { getProjectsByClientIdUseCase } from "@/features/projects/application/get-projects-by-client-id.use-case";
import { getProjectWorkItemByIdUseCase } from "@/features/projects/application/get-project-work-item-by-id.use-case";
import { SupabaseProjectRepository } from "@/features/projects/infrastructure/supabase-project.repository";
import { SupabaseProjectWorkItemRepository } from "@/features/projects/infrastructure/supabase-project-work-item.repository";
import type { WorkItemStatus } from "@/features/projects/domain/project-work-item.types";
import { TicketPriorityBadge, TicketCategoryBadge } from "@/components/admin/support-ticket-badges";
import { SupportTicketStatusForm } from "@/components/admin/support-ticket-status-form";
import { SupportTicketEscalationPanel } from "@/components/admin/support-ticket-escalation-panel";
import { SupportTicketNoteForm } from "@/components/admin/support-ticket-note-form";
import { SupportTicketNoteList } from "@/components/admin/support-ticket-note-list";
import {
  SupportTicketWorkspaceProvider,
  EditTicketButton,
  SupportTicketDetailsSection,
} from "@/components/admin/support-ticket-workspace";
import { AdminSection } from "@/components/admin/admin-card";
import { AdminDetailLayout } from "@/components/admin/admin-detail-layout";
import type { TicketSource } from "@/features/support/domain/support-ticket.types";

export const metadata = { title: "Ticket — Admin", robots: { index: false, follow: false } };

const SOURCE_LABELS: Record<TicketSource, string> = {
  email:         "Email",
  whatsapp:      "WhatsApp",
  manual:        "Manual",
  client_portal: "Portal cliente",
  internal:      "Interno",
};

const WI_STATUS_LABELS: Record<WorkItemStatus, string> = {
  backlog:     "Backlog",
  ready:       "Listo para iniciar",
  in_progress: "En progreso",
  blocked:     "Bloqueado",
  review:      "En revisión",
  testing:     "Testing",
  done:        "Completado",
  cancelled:   "Cancelado",
};

const TERMINAL_WORK_ITEM_STATUSES: WorkItemStatus[] = ["done", "cancelled"];

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div>
      <dt className="mb-0.5 text-xs text-admin-text-muted">{label}</dt>
      <dd className="text-sm text-admin-text break-words">{value}</dd>
    </div>
  );
}

export default async function AdminSupportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const ticketResult = await getSupportTicketByIdUseCase(id, new SupabaseSupportTicketRepository());

  if (!ticketResult.ok) notFound();

  const { ticket } = ticketResult;

  const [clientResult, projectResult, projectsResult, notesResult, workItemResult] = await Promise.all([
    getClientByIdUseCase(ticket.clientId, new SupabaseClientRepository()),
    ticket.projectId
      ? getProjectByIdUseCase(ticket.projectId, new SupabaseProjectRepository())
      : Promise.resolve(null),
    getProjectsByClientIdUseCase(ticket.clientId, new SupabaseProjectRepository()),
    getSupportTicketNotesUseCase(ticket.id, new SupabaseSupportTicketNoteRepository()),
    ticket.escalatedWorkItemId
      ? getProjectWorkItemByIdUseCase(ticket.escalatedWorkItemId, new SupabaseProjectWorkItemRepository())
      : Promise.resolve(null),
  ]);

  const linkedWorkItem = workItemResult?.ok ? workItemResult.workItem : null;
  const linkedWorkItemOpen = linkedWorkItem ? !TERMINAL_WORK_ITEM_STATUSES.includes(linkedWorkItem.status) : false;
  const linkedWorkItemCancelled = linkedWorkItem?.status === "cancelled";

  const projectOptions = projectsResult.ok
    ? projectsResult.projects.map((project) => ({ id: project.id, name: project.name }))
    : [];

  return (
    <SupportTicketWorkspaceProvider
      ticketId={ticket.id}
      title={ticket.title}
      description={ticket.description}
      projectId={ticket.projectId}
      projects={projectOptions}
      reportedBy={ticket.reportedBy}
      source={ticket.source}
      category={ticket.category}
      priority={ticket.priority}
      projectLocked={Boolean(ticket.escalatedWorkItemId)}
    >
    <AdminDetailLayout
      header={
        <div className="border-b border-admin-border px-6 py-5">
          <Link
            href="/admin/support"
            className="mb-3 inline-block text-sm text-admin-text-muted transition-colors hover:text-admin-text"
          >
            ← Volver al listado
          </Link>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-xl font-semibold text-admin-text break-words">{ticket.title}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
                {clientResult.ok ? (
                  <Link
                    href={`/admin/clients/${clientResult.client.id}`}
                    className="text-admin-accent transition-colors hover:underline"
                  >
                    {clientResult.client.name}
                  </Link>
                ) : (
                  <span className="text-admin-text-muted">Cliente no disponible</span>
                )}
                {projectResult?.ok && (
                  <>
                    <span className="text-admin-text-faint">·</span>
                    <Link
                      href={`/admin/projects/${projectResult.project.id}`}
                      className="text-admin-accent transition-colors hover:underline"
                    >
                      {projectResult.project.name}
                    </Link>
                  </>
                )}
              </div>
            </div>
            <EditTicketButton />
          </div>
        </div>
      }
      main={
        <>
          <AdminSection title="Descripción">
            <SupportTicketDetailsSection />
          </AdminSection>

          <AdminSection title="Notas internas">
            <div className="space-y-5">
              {ticket.notes && <Field label="Nota inicial" value={ticket.notes} />}

              <SupportTicketNoteForm ticketId={ticket.id} />

              {notesResult.ok ? (
                <SupportTicketNoteList notes={notesResult.notes} />
              ) : (
                <p className="text-sm text-admin-danger">{notesResult.error}</p>
              )}
            </div>
          </AdminSection>
        </>
      }
      sidebar={
        <>
          <AdminSection title="Estado">
            <div className="flex flex-wrap items-center gap-3">
              <SupportTicketStatusForm ticketId={ticket.id} currentStatus={ticket.status} />
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <TicketPriorityBadge priority={ticket.priority} />
              <TicketCategoryBadge category={ticket.category} />
            </div>
            {linkedWorkItemOpen && ticket.status !== "resolved" && (
              <p className="mt-3 text-xs text-admin-text-faint">
                No se puede resolver mientras el work item de desarrollo vinculado siga abierto.
              </p>
            )}
            {linkedWorkItemCancelled && ticket.status !== "resolved" && (
              <p className="mt-3 text-xs text-admin-warning">
                El trabajo de desarrollo fue cancelado. Confirmá que el caso pueda resolverse por
                otra vía antes de cerrar soporte.
              </p>
            )}
          </AdminSection>

          {linkedWorkItem && (
            <AdminSection title="Desarrollo vinculado">
              <p className="text-sm text-admin-text break-words">{linkedWorkItem.title}</p>
              <p className="mt-1 text-xs text-admin-text-muted">
                {WI_STATUS_LABELS[linkedWorkItem.status]}
              </p>
              {linkedWorkItemCancelled && (
                <p className="mt-2 text-xs text-admin-warning">
                  La intervención de desarrollo fue cancelada. Esto no implica que el ticket de
                  soporte esté resuelto.
                </p>
              )}
              <Link
                href={`/admin/projects/${ticket.projectId}`}
                className="mt-2 inline-block text-sm text-admin-accent transition-colors hover:underline"
              >
                Ver trabajo
              </Link>
            </AdminSection>
          )}

          <AdminSection title="Escalación a desarrollo">
            <SupportTicketEscalationPanel
              ticketId={ticket.id}
              projectId={ticket.projectId}
              escalatedWorkItemId={ticket.escalatedWorkItemId}
              escalatedAt={ticket.escalatedAt}
              escalatedBy={ticket.escalatedBy}
            />
          </AdminSection>

          <AdminSection title="Metadata">
            <dl className="space-y-4">
              <Field label="Reportado por" value={ticket.reportedBy} />
              <Field label="Fuente"        value={SOURCE_LABELS[ticket.source]} />
              <Field label="Creado"        value={new Date(ticket.createdAt).toLocaleString("es-AR")} />
              <Field label="Actualizado"   value={new Date(ticket.updatedAt).toLocaleString("es-AR")} />
              {ticket.resolvedAt && (
                <Field label="Resuelto" value={new Date(ticket.resolvedAt).toLocaleString("es-AR")} />
              )}
            </dl>
          </AdminSection>
        </>
      }
    />
    </SupportTicketWorkspaceProvider>
  );
}
