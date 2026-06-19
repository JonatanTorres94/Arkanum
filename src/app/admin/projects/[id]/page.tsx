import Link from "next/link";
import { notFound } from "next/navigation";
import { verifyAdmin } from "@/lib/auth/verify-admin";
import { getProjectByIdUseCase } from "@/features/projects/application/get-project-by-id.use-case";
import { SupabaseProjectRepository } from "@/features/projects/infrastructure/supabase-project.repository";
import { getClientByIdUseCase } from "@/features/clients/application/get-client-by-id.use-case";
import { SupabaseClientRepository } from "@/features/clients/infrastructure/supabase-client.repository";
import { getProjectRepositoryLinksUseCase } from "@/features/projects/application/get-project-repository-links.use-case";
import { SupabaseProjectRepositoryLinkRepository } from "@/features/projects/infrastructure/supabase-project-repository-link.repository";
import { getProjectEnvironmentsUseCase } from "@/features/projects/application/get-project-environments.use-case";
import { SupabaseProjectEnvironmentRepository } from "@/features/projects/infrastructure/supabase-project-environment.repository";
import { ProjectStatusBadge } from "@/components/admin/project-status-badge";
import { ProjectRepositoryForm } from "@/components/admin/project-repository-form";
import { ProjectEnvironmentForm } from "@/components/admin/project-environment-form";
import { signOutAction } from "@/server/actions/auth.action";

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

export const metadata = { title: "Proyecto — Admin", robots: { index: false, follow: false } };

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div>
      <dt className="mb-0.5 text-xs text-slate-500">{label}</dt>
      <dd className="text-sm text-slate-200 break-words">{value}</dd>
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
  await verifyAdmin();

  const { id } = await params;

  const projectResult = await getProjectByIdUseCase(id, new SupabaseProjectRepository());

  if (!projectResult.ok) notFound();

  const { project } = projectResult;

  const [clientResult, repositoriesResult, environmentsResult] = await Promise.all([
    getClientByIdUseCase(project.clientId, new SupabaseClientRepository()),
    getProjectRepositoryLinksUseCase(id, new SupabaseProjectRepositoryLinkRepository()),
    getProjectEnvironmentsUseCase(id, new SupabaseProjectEnvironmentRepository()),
  ]);

  return (
    <div className="min-h-screen px-6 py-10">
      <div className="mx-auto max-w-2xl space-y-6">

        {/* Nav */}
        <div className="flex items-center justify-between">
          <Link
            href="/admin/projects"
            className="text-sm text-slate-500 transition-colors hover:text-slate-300"
          >
            ← Volver al listado
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

        {/* Header summary */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-xl font-semibold text-slate-50 break-words">{project.name}</h1>
              {clientResult.ok ? (
                <Link
                  href={`/admin/clients/${clientResult.client.id}`}
                  className="mt-1 inline-block text-sm text-cyan-400 transition-colors hover:text-cyan-300"
                >
                  {clientResult.client.name}
                </Link>
              ) : (
                <p className="mt-1 text-sm text-slate-500">Cliente no disponible</p>
              )}
            </div>
            <ProjectStatusBadge status={project.status} />
          </div>
        </div>

        {/* Datos */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 sm:p-6">
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Fecha de inicio"  value={formatDate(project.startDate)} />
            <Field label="Fecha objetivo"   value={formatDate(project.targetDate)} />
            <Field label="Creado"           value={new Date(project.createdAt).toLocaleString("es-AR")} />
            <Field label="Actualizado"      value={new Date(project.updatedAt).toLocaleString("es-AR")} />
          </dl>

          {project.description && (
            <div className="mt-6 border-t border-slate-800 pt-6">
              <Field label="Descripción" value={project.description} />
            </div>
          )}

          {project.notes && (
            <div className="mt-6 border-t border-slate-800 pt-6">
              <Field label="Notas internas" value={project.notes} />
            </div>
          )}
        </div>

        {/* Repositorios */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 sm:p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-slate-500">
            Repositorios
          </h2>

          {!repositoriesResult.ok ? (
            <p className="mb-4 text-sm text-red-400">{repositoriesResult.error}</p>
          ) : repositoriesResult.repositories.length === 0 ? (
            <p className="mb-4 text-sm text-slate-600">Todavía no hay repositorios vinculados.</p>
          ) : (
            <ul className="mb-4 space-y-2">
              {repositoriesResult.repositories.map((repo) => (
                <li
                  key={repo.id}
                  className="rounded-lg border border-slate-800 bg-slate-900/60 px-4 py-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <a
                      href={repo.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-slate-100 hover:text-cyan-400"
                    >
                      {repo.name}
                    </a>
                    <span className="text-xs text-slate-500">
                      {PROVIDER_LABELS[repo.provider] ?? repo.provider}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {[repo.owner, repo.defaultBranch].filter(Boolean).join(" · ") || "—"}
                  </p>
                  {repo.notes && (
                    <p className="mt-1.5 text-xs text-slate-400 break-words">{repo.notes}</p>
                  )}
                </li>
              ))}
            </ul>
          )}

          <ProjectRepositoryForm projectId={project.id} />
        </div>

        {/* Entornos */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 sm:p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-slate-500">
            Entornos
          </h2>

          {!environmentsResult.ok ? (
            <p className="mb-4 text-sm text-red-400">{environmentsResult.error}</p>
          ) : environmentsResult.environments.length === 0 ? (
            <p className="mb-4 text-sm text-slate-600">Todavía no hay entornos registrados.</p>
          ) : (
            <ul className="mb-4 space-y-2">
              {environmentsResult.environments.map((env) => (
                <li
                  key={env.id}
                  className="rounded-lg border border-slate-800 bg-slate-900/60 px-4 py-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    {env.url ? (
                      <a
                        href={env.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-slate-100 hover:text-cyan-400"
                      >
                        {env.name}
                      </a>
                    ) : (
                      <span className="text-sm font-medium text-slate-100">{env.name}</span>
                    )}
                    <span className="text-xs text-slate-500">
                      {ENV_TYPE_LABELS[env.type] ?? env.type} · {ENV_STATUS_LABELS[env.status] ?? env.status}
                    </span>
                  </div>
                  {env.notes && (
                    <p className="mt-1.5 text-xs text-slate-400 break-words">{env.notes}</p>
                  )}
                </li>
              ))}
            </ul>
          )}

          <ProjectEnvironmentForm projectId={project.id} />
        </div>

      </div>
    </div>
  );
}
