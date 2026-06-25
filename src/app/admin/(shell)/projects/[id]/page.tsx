import Link from "next/link";
import { notFound } from "next/navigation";
import { getProjectByIdUseCase } from "@/features/projects/application/get-project-by-id.use-case";
import { SupabaseProjectRepository } from "@/features/projects/infrastructure/supabase-project.repository";
import { getClientByIdUseCase } from "@/features/clients/application/get-client-by-id.use-case";
import { SupabaseClientRepository } from "@/features/clients/infrastructure/supabase-client.repository";
import { getProjectRepositoryLinksUseCase } from "@/features/projects/application/get-project-repository-links.use-case";
import { SupabaseProjectRepositoryLinkRepository } from "@/features/projects/infrastructure/supabase-project-repository-link.repository";
import { getProjectEnvironmentsUseCase } from "@/features/projects/application/get-project-environments.use-case";
import { SupabaseProjectEnvironmentRepository } from "@/features/projects/infrastructure/supabase-project-environment.repository";
import { getProjectWorkItemsUseCase } from "@/features/projects/application/get-project-work-items.use-case";
import { SupabaseProjectWorkItemRepository } from "@/features/projects/infrastructure/supabase-project-work-item.repository";
import { getSupportTicketByWorkItemUseCase } from "@/features/support/application/get-support-ticket-by-work-item.use-case";
import { SupabaseSupportTicketRepository } from "@/features/support/infrastructure/supabase-support-ticket.repository";
import { computeLifecycleWarnings } from "@/features/projects/domain/project-lifecycle";
import type { TicketStatus } from "@/features/support/domain/support-ticket.types";
import { ProjectStatusBadge } from "@/components/admin/project-status-badge";
import { ProjectRepositoryForm } from "@/components/admin/project-repository-form";
import { ProjectEnvironmentForm } from "@/components/admin/project-environment-form";
import { ProjectWorkItemForm } from "@/components/admin/project-work-item-form";
import { ProjectWorkItemStatusForm } from "@/components/admin/project-work-item-status-form";
import { TicketStatusBadge } from "@/components/admin/support-ticket-badges";
import { AdminSection } from "@/components/admin/admin-card";
import { AdminDetailLayout } from "@/components/admin/admin-detail-layout";
import {
  ProjectWorkspaceProvider,
  EditProjectButton,
  ProjectDetailsSection,
} from "@/components/admin/project-workspace";

// Badge accent hues stay literal (not tokenized): translucent tinted badges
// read fine on both light and dark surfaces by construction, and there are
// too many distinct enum values here to justify per-mode token overrides.
const PROVIDER_LABELS: Record<string, string> = { github: "GitHub", other: "Otro" };
const ENV_TYPE_LABELS: Record<string, string> = {
  development: "Desarrollo",
  staging:     "Staging",
  production:  "Producción",
  demo:        "Demo",
  other:       "Otro",
};
const ENV_STATUS_LABELS: Record<string, string> = {
  active:   "Activo",
  inactive: "Inactivo",
  degraded: "Degradado",
};

const WI_CATEGORY_LABELS: Record<string, string> = {
  feature:            "Feature",
  bug:                "Bug",
  task:               "Tarea",
  improvement:        "Mejora",
  technical_debt:     "Deuda técnica",
  research:           "Investigación",
  support_escalation: "Escalación de soporte",
};
const WI_PRIORITY_LABELS: Record<string, string> = {
  low:    "Baja",
  medium: "Media",
  high:   "Alta",
  urgent: "Urgente",
};
const WI_PRIORITY_COLORS: Record<string, string> = {
  low:    "bg-slate-400/10 text-slate-400 border-slate-700",
  medium: "bg-cyan-400/10 text-cyan-400 border-cyan-400/20",
  high:   "bg-amber-400/10 text-amber-400 border-amber-400/20",
  urgent: "bg-red-400/10 text-red-400 border-red-400/20",
};

export const metadata = { title: "Proyecto — Admin", robots: { index: false, follow: false } };

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div>
      <dt className="mb-0.5 text-xs text-admin-text-muted">{label}</dt>
      <dd className="text-sm text-admin-text break-words">{value}</dd>
    </div>
  );
}

function formatDate(value: string | null): string | null {
  if (!value) return null;
  return new Date(`${value}T00:00:00Z`).toLocaleDateString("es-AR", {
    day:   "2-digit",
    month: "short",
    year:  "numeric",
  });
}

export default async function AdminProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const projectResult = await getProjectByIdUseCase(id, new SupabaseProjectRepository());

  if (!projectResult.ok) notFound();

  const { project } = projectResult;

  const [clientResult, repositoriesResult, environmentsResult, workItemsResult] = await Promise.all([
    getClientByIdUseCase(project.clientId, new SupabaseClientRepository()),
    getProjectRepositoryLinksUseCase(id, new SupabaseProjectRepositoryLinkRepository()),
    getProjectEnvironmentsUseCase(id, new SupabaseProjectEnvironmentRepository()),
    getProjectWorkItemsUseCase(id, new SupabaseProjectWorkItemRepository()),
  ]);

  const workItems = workItemsResult.ok ? workItemsResult.workItems : [];

  const lifecycleWarnings = computeLifecycleWarnings(project, workItems);

  // Origin ticket lookup stays per-item (no bulk method) — work item lists are
  // small in this MVP, so N lookups is simpler than introducing a batched query.
  const linkedTicketsByWorkItemId = new Map<string, { id: string; title: string; status: TicketStatus }>();
  if (workItemsResult.ok) {
    const ticketRepository = new SupabaseSupportTicketRepository();
    const lookups = await Promise.all(
      workItemsResult.workItems.map((item) => getSupportTicketByWorkItemUseCase(item.id, ticketRepository))
    );
    workItemsResult.workItems.forEach((item, index) => {
      const lookup = lookups[index];
      if (lookup.ok && lookup.ticket) {
        linkedTicketsByWorkItemId.set(item.id, {
          id:     lookup.ticket.id,
          title:  lookup.ticket.title,
          status: lookup.ticket.status,
        });
      }
    });
  }

  return (
    <ProjectWorkspaceProvider
      projectId={project.id}
      name={project.name}
      description={project.description}
      status={project.status}
      startDate={project.startDate}
      targetDate={project.targetDate}
      notes={project.notes}
      workItems={workItems}
    >
      <AdminDetailLayout
        header={
          <div className="border-b border-admin-border px-6 py-5">
            <Link
              href="/admin/projects"
              className="mb-3 inline-block text-sm text-admin-text-muted transition-colors hover:text-admin-text"
            >
              ← Volver al listado
            </Link>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="text-xl font-semibold text-admin-text break-words">{project.name}</h1>
                {clientResult.ok ? (
                  <Link
                    href={`/admin/clients/${clientResult.client.id}`}
                    className="mt-1 inline-block text-sm text-admin-accent transition-colors hover:underline"
                  >
                    {clientResult.client.name}
                  </Link>
                ) : (
                  <p className="mt-1 text-sm text-admin-text-muted">Cliente no disponible</p>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <ProjectStatusBadge status={project.status} />
                <EditProjectButton />
              </div>
            </div>
          </div>
        }
        main={
          <>
            {/* Project details — read-only summary or edit form */}
            <AdminSection title="Detalles del proyecto">
              <ProjectDetailsSection />
            </AdminSection>

            {/* Work items */}
            <AdminSection title={`Work items${workItemsResult.ok ? ` (${workItemsResult.workItems.length})` : ""}`}>
              {!workItemsResult.ok ? (
                <p className="mb-4 text-sm text-admin-danger">{workItemsResult.error}</p>
              ) : workItemsResult.workItems.length === 0 ? (
                <p className="mb-4 text-sm text-admin-text-faint">Todavía no hay work items registrados.</p>
              ) : (
                <ul className="mb-4 space-y-2">
                  {workItemsResult.workItems.map((item) => {
                    const linkedTicket = linkedTicketsByWorkItemId.get(item.id);

                    return (
                      <li
                        key={item.id}
                        className="rounded-lg border border-admin-border bg-admin-surface-hover px-4 py-3"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <Link
                            href={`/admin/projects/${project.id}/work-items/${item.id}`}
                            className="text-sm font-medium text-admin-text hover:text-admin-accent"
                          >
                            {item.title}
                          </Link>
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="rounded-full border border-admin-border-strong bg-admin-surface px-2 py-0.5 text-xs text-admin-text-muted">
                              {WI_CATEGORY_LABELS[item.category] ?? item.category}
                            </span>
                            <span className={`rounded-full border px-2 py-0.5 text-xs ${WI_PRIORITY_COLORS[item.priority] ?? ""}`}>
                              {WI_PRIORITY_LABELS[item.priority] ?? item.priority}
                            </span>
                          </div>
                        </div>
                        {item.description && (
                          <p className="mt-1.5 line-clamp-2 text-xs text-admin-text-muted break-words">
                            {item.description}
                          </p>
                        )}
                        <div className="mt-2.5">
                          <ProjectWorkItemStatusForm workItemId={item.id} currentStatus={item.status} />
                        </div>
                        <p className="mt-1.5 text-xs text-admin-text-faint">
                          {new Date(item.createdAt).toLocaleDateString("es-AR", {
                            day:   "2-digit",
                            month: "short",
                            year:  "numeric",
                          })}
                        </p>
                        {linkedTicket && (
                          <div className="mt-2.5 rounded-lg border border-admin-border-strong bg-admin-surface px-3 py-2.5">
                            <p className="mb-1 text-xs font-medium text-admin-text-muted">Origen: Soporte</p>
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="text-sm text-admin-text break-words">{linkedTicket.title}</span>
                              <TicketStatusBadge status={linkedTicket.status} />
                            </div>
                            <Link
                              href={`/admin/support/${linkedTicket.id}`}
                              className="mt-1.5 inline-block text-xs text-admin-accent transition-colors hover:underline"
                            >
                              Ver ticket
                            </Link>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}

              <ProjectWorkItemForm projectId={project.id} />
            </AdminSection>

            {/* Repositorios */}
            <AdminSection title="Repositorios">
              {!repositoriesResult.ok ? (
                <p className="mb-4 text-sm text-admin-danger">{repositoriesResult.error}</p>
              ) : repositoriesResult.repositories.length === 0 ? (
                <p className="mb-4 text-sm text-admin-text-faint">Todavía no hay repositorios vinculados.</p>
              ) : (
                <ul className="mb-4 space-y-2">
                  {repositoriesResult.repositories.map((repo) => (
                    <li
                      key={repo.id}
                      className="rounded-lg border border-admin-border bg-admin-surface-hover px-4 py-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <a
                          href={repo.repoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-admin-text hover:text-admin-accent"
                        >
                          {repo.name}
                        </a>
                        <span className="text-xs text-admin-text-muted">
                          {PROVIDER_LABELS[repo.provider] ?? repo.provider}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-admin-text-muted">
                        {[repo.owner, repo.defaultBranch].filter(Boolean).join(" · ") || "—"}
                      </p>
                      {repo.notes && (
                        <p className="mt-1.5 text-xs text-admin-text-muted break-words">{repo.notes}</p>
                      )}
                    </li>
                  ))}
                </ul>
              )}

              <ProjectRepositoryForm projectId={project.id} />
            </AdminSection>

            {/* Entornos */}
            <AdminSection title="Entornos">
              {!environmentsResult.ok ? (
                <p className="mb-4 text-sm text-admin-danger">{environmentsResult.error}</p>
              ) : environmentsResult.environments.length === 0 ? (
                <p className="mb-4 text-sm text-admin-text-faint">Todavía no hay entornos registrados.</p>
              ) : (
                <ul className="mb-4 space-y-2">
                  {environmentsResult.environments.map((env) => (
                    <li
                      key={env.id}
                      className="rounded-lg border border-admin-border bg-admin-surface-hover px-4 py-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        {env.url ? (
                          <a
                            href={env.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-admin-text hover:text-admin-accent"
                          >
                            {env.name}
                          </a>
                        ) : (
                          <span className="text-sm font-medium text-admin-text">{env.name}</span>
                        )}
                        <span className="text-xs text-admin-text-muted">
                          {ENV_TYPE_LABELS[env.type] ?? env.type} · {ENV_STATUS_LABELS[env.status] ?? env.status}
                        </span>
                      </div>
                      {env.notes && (
                        <p className="mt-1.5 text-xs text-admin-text-muted break-words">{env.notes}</p>
                      )}
                    </li>
                  ))}
                </ul>
              )}

              <ProjectEnvironmentForm projectId={project.id} />
            </AdminSection>
          </>
        }
        sidebar={
          <>
            {lifecycleWarnings.length > 0 && (
              <AdminSection title="Advertencias">
                <ul className="space-y-2">
                  {lifecycleWarnings.map((w, i) => (
                    <li
                      key={i}
                      className="rounded-lg border border-amber-400/20 bg-amber-400/5 px-3 py-2.5 text-xs text-amber-400"
                    >
                      {w.message}
                    </li>
                  ))}
                </ul>
              </AdminSection>
            )}

            <AdminSection title="Metadata">
              <dl className="space-y-4">
                <Field label="Fecha de inicio"  value={formatDate(project.startDate)} />
                <Field label="Fecha objetivo"   value={formatDate(project.targetDate)} />
                <Field label="Creado"           value={new Date(project.createdAt).toLocaleString("es-AR")} />
                <Field label="Actualizado"      value={new Date(project.updatedAt).toLocaleString("es-AR")} />
              </dl>
            </AdminSection>
          </>
        }
      />
    </ProjectWorkspaceProvider>
  );
}
