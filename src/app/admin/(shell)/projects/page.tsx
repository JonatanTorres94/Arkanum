import Link from "next/link";
import { getProjectsUseCase } from "@/features/projects/application/get-projects.use-case";
import { SupabaseProjectRepository } from "@/features/projects/infrastructure/supabase-project.repository";
import { getClientsUseCase } from "@/features/clients/application/get-clients.use-case";
import { SupabaseClientRepository } from "@/features/clients/infrastructure/supabase-client.repository";
import { ProjectStatusBadge } from "@/components/admin/project-status-badge";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminEmptyState } from "@/components/admin/admin-empty-state";

export const metadata = { title: "Proyectos — Admin", robots: { index: false, follow: false } };

function formatDate(value: string | null): string {
  if (!value) return "—";
  return new Date(`${value}T00:00:00Z`).toLocaleDateString("es-AR", {
    day:   "2-digit",
    month: "short",
    year:  "numeric",
  });
}

export default async function AdminProjectsPage() {
  const [projectsResult, clientsResult] = await Promise.all([
    getProjectsUseCase(new SupabaseProjectRepository()),
    getClientsUseCase(new SupabaseClientRepository()),
  ]);

  const clientNameById = new Map(
    clientsResult.ok ? clientsResult.clients.map((c) => [c.id, c.name]) : []
  );

  return (
    <div>
      <AdminPageHeader
        title="Proyectos"
        count={projectsResult.ok ? projectsResult.projects.length : undefined}
        action={
          <Link
            href="/admin/projects/new"
            className="rounded-lg border border-admin-border-strong px-4 py-2 text-sm text-admin-text-secondary transition-colors hover:border-admin-accent hover:text-admin-text"
          >
            Crear proyecto
          </Link>
        }
      />

      <div className="px-6 py-6">
        {!projectsResult.ok ? (
          <p className="text-sm text-admin-danger">{projectsResult.error}</p>

        ) : projectsResult.projects.length === 0 ? (
          <AdminEmptyState message="Todavía no hay proyectos registrados." />

        ) : (
          <div className="overflow-x-auto rounded-xl border border-admin-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-admin-border bg-admin-surface-hover">
                  <th className="px-4 py-3 text-left font-medium text-admin-text-muted">Nombre</th>
                  <th className="px-4 py-3 text-left font-medium text-admin-text-muted">Cliente</th>
                  <th className="px-4 py-3 text-left font-medium text-admin-text-muted">Estado</th>
                  <th className="hidden px-4 py-3 text-left font-medium text-admin-text-muted sm:table-cell">Inicio</th>
                  <th className="hidden px-4 py-3 text-left font-medium text-admin-text-muted sm:table-cell">Objetivo</th>
                  <th className="hidden px-4 py-3 text-left font-medium text-admin-text-muted md:table-cell">Creado</th>
                </tr>
              </thead>
              <tbody>
                {projectsResult.projects.map((project) => (
                  <tr
                    key={project.id}
                    className="border-b border-admin-border transition-colors last:border-0 hover:bg-admin-surface-hover"
                  >
                    <td className="px-4 py-3.5">
                      <Link
                        href={`/admin/projects/${project.id}`}
                        className="font-medium text-admin-text hover:text-admin-accent"
                      >
                        {project.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3.5 text-admin-text-secondary">
                      {clientNameById.get(project.clientId) ?? "—"}
                    </td>
                    <td className="px-4 py-3.5">
                      <ProjectStatusBadge status={project.status} />
                    </td>
                    <td className="hidden px-4 py-3.5 text-admin-text-secondary sm:table-cell">
                      {formatDate(project.startDate)}
                    </td>
                    <td className="hidden px-4 py-3.5 text-admin-text-secondary sm:table-cell">
                      {formatDate(project.targetDate)}
                    </td>
                    <td className="hidden px-4 py-3.5 text-admin-text-faint md:table-cell">
                      {new Date(project.createdAt).toLocaleDateString("es-AR", {
                        day:   "2-digit",
                        month: "short",
                        year:  "numeric",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
