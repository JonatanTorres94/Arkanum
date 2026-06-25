import Link from "next/link";
import { notFound } from "next/navigation";
import { SupabaseClientRepository } from "@/features/clients/infrastructure/supabase-client.repository";
import { SupabaseProjectRepository } from "@/features/projects/infrastructure/supabase-project.repository";
import { SupabaseSupportTicketRepository } from "@/features/support/infrastructure/supabase-support-ticket.repository";
import { getClientByIdUseCase } from "@/features/clients/application/get-client-by-id.use-case";
import { getClientOperationalOverviewUseCase } from "@/features/clients/application/get-client-operational-overview.use-case";
import { ClientStatusBadge } from "@/components/admin/client-status-badge";
import { ProjectStatusBadge } from "@/components/admin/project-status-badge";
import { TicketStatusBadge } from "@/components/admin/support-ticket-badges";
import { AdminSection } from "@/components/admin/admin-card";
import { AdminDetailLayout } from "@/components/admin/admin-detail-layout";
import {
  ClientWorkspaceProvider,
  EditClientButton,
  ClientDetailsSection,
} from "@/components/admin/client-workspace";
import type { TicketPriority } from "@/features/support/domain/support-ticket.types";

export const metadata = { title: "Cliente — Admin", robots: { index: false, follow: false } };

const TICKET_PRIORITY_LABELS: Record<TicketPriority, string> = {
  low:    "Baja",
  medium: "Media",
  high:   "Alta",
  urgent: "Urgente",
};
const TICKET_PRIORITY_COLORS: Record<TicketPriority, string> = {
  low:    "bg-slate-400/10 text-slate-400 border-slate-700",
  medium: "bg-cyan-400/10 text-cyan-400 border-cyan-400/20",
  high:   "bg-amber-400/10 text-amber-400 border-amber-400/20",
  urgent: "bg-red-400/10 text-red-400 border-red-400/20",
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

function OverviewStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-admin-text-muted">{label}</span>
      <span className="text-sm font-medium text-admin-text">{value}</span>
    </div>
  );
}

export default async function AdminClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const clientResult = await getClientByIdUseCase(id, new SupabaseClientRepository());
  if (!clientResult.ok) notFound();

  const { client } = clientResult;

  const overviewResult = await getClientOperationalOverviewUseCase(
    id,
    new SupabaseProjectRepository(),
    new SupabaseSupportTicketRepository()
  );

  const { projects: projectsResult, support: supportResult, latestRelatedActivityAt } = overviewResult;

  return (
    <ClientWorkspaceProvider
      clientId={client.id}
      name={client.name}
      company={client.company}
      contactName={client.contactName}
      contactEmail={client.contactEmail}
      contactPhone={client.contactPhone}
      industry={client.industry}
      status={client.status}
      notes={client.notes}
    >
      <AdminDetailLayout
        header={
          <div className="border-b border-admin-border px-6 py-5">
            <Link
              href="/admin/clients"
              className="mb-3 inline-block text-sm text-admin-text-muted transition-colors hover:text-admin-text"
            >
              ← Volver al listado
            </Link>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="text-xl font-semibold text-admin-text break-words">{client.name}</h1>
                {client.company && (
                  <p className="mt-1 text-sm text-admin-text-muted break-words">{client.company}</p>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <ClientStatusBadge status={client.status} />
                <EditClientButton />
              </div>
            </div>
          </div>
        }
        main={
          <>
            {/* Client details — read-only or edit form */}
            <AdminSection title="Datos del cliente">
              <ClientDetailsSection />
            </AdminSection>

            {/* Proyectos */}
            <AdminSection
              title={
                projectsResult.ok
                  ? `Proyectos (${projectsResult.items.length})`
                  : "Proyectos"
              }
            >
              <div className="mb-4 flex items-center justify-end">
                <Link
                  href={`/admin/projects/new?clientId=${client.id}`}
                  className="text-xs text-admin-accent transition-colors hover:underline"
                >
                  Crear proyecto
                </Link>
              </div>

              {!projectsResult.ok ? (
                <p className="text-sm text-admin-danger">{projectsResult.error}</p>
              ) : projectsResult.items.length === 0 ? (
                <p className="text-sm text-admin-text-faint">Este cliente todavía no tiene proyectos.</p>
              ) : (
                <ul className="space-y-2">
                  {projectsResult.items.map((project) => (
                    <li
                      key={project.id}
                      className="flex items-center justify-between rounded-lg border border-admin-border bg-admin-surface-hover px-4 py-3"
                    >
                      <Link
                        href={`/admin/projects/${project.id}`}
                        className="text-sm font-medium text-admin-text hover:text-admin-accent"
                      >
                        {project.name}
                      </Link>
                      <ProjectStatusBadge status={project.status} />
                    </li>
                  ))}
                </ul>
              )}
            </AdminSection>

            {/* Tickets de soporte */}
            <AdminSection
              title={
                supportResult.ok
                  ? `Tickets de soporte (${supportResult.items.length})`
                  : "Tickets de soporte"
              }
            >
              {!supportResult.ok ? (
                <p className="text-sm text-admin-danger">{supportResult.error}</p>
              ) : supportResult.items.length === 0 ? (
                <p className="text-sm text-admin-text-faint">Este cliente todavía no tiene tickets de soporte.</p>
              ) : (
                <ul className="space-y-2">
                  {supportResult.items.map((ticket) => (
                    <li
                      key={ticket.id}
                      className="rounded-lg border border-admin-border bg-admin-surface-hover px-4 py-3"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <Link
                          href={`/admin/support/${ticket.id}`}
                          className="text-sm font-medium text-admin-text hover:text-admin-accent break-words"
                        >
                          {ticket.title}
                        </Link>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className={`rounded-full border px-2 py-0.5 text-xs ${TICKET_PRIORITY_COLORS[ticket.priority]}`}>
                            {TICKET_PRIORITY_LABELS[ticket.priority]}
                          </span>
                          <TicketStatusBadge status={ticket.status} />
                        </div>
                      </div>
                      <p className="mt-1.5 text-xs text-admin-text-faint">
                        Actualizado:{" "}
                        {new Date(ticket.updatedAt).toLocaleDateString("es-AR", {
                          day:   "2-digit",
                          month: "short",
                          year:  "numeric",
                        })}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </AdminSection>
          </>
        }
        sidebar={
          <>
            {/* Resumen operativo */}
            <AdminSection title="Resumen operativo">
              <div className="space-y-4">
                {/* Projects summary */}
                <div className="space-y-1.5">
                  <p className="text-xs font-medium text-admin-text-secondary">Proyectos</p>
                  {!projectsResult.ok ? (
                    <p className="text-xs text-admin-danger">{projectsResult.error}</p>
                  ) : (
                    <>
                      <OverviewStat label="Total"         value={projectsResult.summary.total} />
                      <OverviewStat label="En desarrollo" value={projectsResult.summary.inDevelopment} />
                      <OverviewStat label="Pausados"      value={projectsResult.summary.paused} />
                      <OverviewStat label="Desplegados"   value={projectsResult.summary.deployed} />
                    </>
                  )}
                </div>

                {/* Support summary */}
                <div className="space-y-1.5">
                  <p className="text-xs font-medium text-admin-text-secondary">Soporte</p>
                  {!supportResult.ok ? (
                    <p className="text-xs text-admin-danger">{supportResult.error}</p>
                  ) : (
                    <>
                      <OverviewStat label="Total"                  value={supportResult.summary.total} />
                      <OverviewStat label="Tickets abiertos"       value={supportResult.summary.open} />
                      <OverviewStat label="Escalados a desarrollo" value={supportResult.summary.escalatedToDevelopment} />
                    </>
                  )}
                </div>

                {/* Latest activity — only conclusive when both sources loaded */}
                {latestRelatedActivityAt ? (
                  <div>
                    <p className="text-xs text-admin-text-muted">Última actividad relacionada</p>
                    <p className="mt-0.5 text-xs text-admin-text">
                      {new Date(latestRelatedActivityAt).toLocaleDateString("es-AR", {
                        day:   "2-digit",
                        month: "short",
                        year:  "numeric",
                      })}
                    </p>
                  </div>
                ) : projectsResult.ok && supportResult.ok ? (
                  <p className="text-xs text-admin-text-faint">Sin actividad operativa.</p>
                ) : null}
              </div>
            </AdminSection>

            {/* Contacto */}
            <AdminSection title="Contacto principal">
              <dl className="space-y-3">
                <Field label="Nombre"              value={client.contactName} />
                <Field label="Email"               value={client.contactEmail} />
                <Field label="Teléfono / WhatsApp" value={client.contactPhone} />
                {!client.contactName && !client.contactEmail && !client.contactPhone && (
                  <p className="text-sm text-admin-text-faint">Sin datos de contacto.</p>
                )}
              </dl>
            </AdminSection>

            {/* Metadata */}
            <AdminSection title="Metadata">
              <dl className="space-y-3">
                <Field label="Creado"      value={new Date(client.createdAt).toLocaleString("es-AR")} />
                <Field label="Actualizado" value={new Date(client.updatedAt).toLocaleString("es-AR")} />
              </dl>
            </AdminSection>
          </>
        }
      />
    </ClientWorkspaceProvider>
  );
}
