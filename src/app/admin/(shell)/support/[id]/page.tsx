import Link from "next/link";
import { notFound } from "next/navigation";
import { getSupportTicketByIdUseCase } from "@/features/support/application/get-support-ticket-by-id.use-case";
import { SupabaseSupportTicketRepository } from "@/features/support/infrastructure/supabase-support-ticket.repository";
import { getClientByIdUseCase } from "@/features/clients/application/get-client-by-id.use-case";
import { SupabaseClientRepository } from "@/features/clients/infrastructure/supabase-client.repository";
import { getProjectByIdUseCase } from "@/features/projects/application/get-project-by-id.use-case";
import { SupabaseProjectRepository } from "@/features/projects/infrastructure/supabase-project.repository";
import { TicketPriorityBadge, TicketCategoryBadge } from "@/components/admin/support-ticket-badges";
import { SupportTicketStatusForm } from "@/components/admin/support-ticket-status-form";
import { SupportTicketEscalationPanel } from "@/components/admin/support-ticket-escalation-panel";
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

  const [clientResult, projectResult] = await Promise.all([
    getClientByIdUseCase(ticket.clientId, new SupabaseClientRepository()),
    ticket.projectId
      ? getProjectByIdUseCase(ticket.projectId, new SupabaseProjectRepository())
      : Promise.resolve(null),
  ]);

  return (
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
          </div>
        </div>
      }
      main={
        <>
          <AdminSection title="Descripción">
            <Field label="Descripción" value={ticket.description ?? "Sin descripción."} />
          </AdminSection>

          <AdminSection title="Notas internas">
            <Field label="Notas" value={ticket.notes ?? "Sin notas internas."} />
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
          </AdminSection>

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
  );
}
