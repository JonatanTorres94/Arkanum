import Link from "next/link";
import { verifyAdmin } from "@/lib/auth/verify-admin";
import { getProjectsUseCase } from "@/features/projects/application/get-projects.use-case";
import { SupabaseProjectRepository } from "@/features/projects/infrastructure/supabase-project.repository";
import { getClientsUseCase } from "@/features/clients/application/get-clients.use-case";
import { SupabaseClientRepository } from "@/features/clients/infrastructure/supabase-client.repository";
import { ProjectStatusBadge } from "@/components/admin/project-status-badge";
import { signOutAction } from "@/server/actions/auth.action";

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
  await verifyAdmin();

  const [projectsResult, clientsResult] = await Promise.all([
    getProjectsUseCase(new SupabaseProjectRepository()),
    getClientsUseCase(new SupabaseClientRepository()),
  ]);

  const clientNameById = new Map(
    clientsResult.ok ? clientsResult.clients.map((c) => [c.id, c.name]) : []
  );

  return (
    <div className="min-h-screen px-6 py-10">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-slate-50">
            Proyectos
            {projectsResult.ok && (
              <span className="ml-2 text-base font-normal text-slate-500">
                ({projectsResult.projects.length})
              </span>
            )}
          </h1>
          <div className="flex items-center gap-5">
            <Link
              href="/admin/projects/new"
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition-colors hover:border-slate-500 hover:text-slate-100"
            >
              Crear proyecto
            </Link>
            <form action={signOutAction}>
              <button
                type="submit"
                className="text-sm text-slate-500 transition-colors hover:text-slate-300"
              >
                Cerrar sesión
              </button>
            </form>
          </div>
        </div>

        {/* Content */}
        {!projectsResult.ok ? (
          <p className="text-sm text-red-400">{projectsResult.error}</p>

        ) : projectsResult.projects.length === 0 ? (
          <div className="rounded-xl border border-slate-800 bg-slate-900/20 px-6 py-14 text-center">
            <p className="text-sm text-slate-400">Todavía no hay proyectos registrados.</p>
          </div>

        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/60">
                  <th className="px-4 py-3 text-left font-medium text-slate-400">Nombre</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-400">Cliente</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-400">Estado</th>
                  <th className="hidden px-4 py-3 text-left font-medium text-slate-400 sm:table-cell">Inicio</th>
                  <th className="hidden px-4 py-3 text-left font-medium text-slate-400 sm:table-cell">Objetivo</th>
                  <th className="hidden px-4 py-3 text-left font-medium text-slate-400 md:table-cell">Creado</th>
                </tr>
              </thead>
              <tbody>
                {projectsResult.projects.map((project) => (
                  <tr
                    key={project.id}
                    className="border-b border-slate-800/60 transition-colors last:border-0 hover:bg-slate-900/40"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/projects/${project.id}`}
                        className="font-medium text-slate-100 hover:text-cyan-400"
                      >
                        {project.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      {clientNameById.get(project.clientId) ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <ProjectStatusBadge status={project.status} />
                    </td>
                    <td className="hidden px-4 py-3 text-slate-400 sm:table-cell">
                      {formatDate(project.startDate)}
                    </td>
                    <td className="hidden px-4 py-3 text-slate-400 sm:table-cell">
                      {formatDate(project.targetDate)}
                    </td>
                    <td className="hidden px-4 py-3 text-slate-500 md:table-cell">
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
