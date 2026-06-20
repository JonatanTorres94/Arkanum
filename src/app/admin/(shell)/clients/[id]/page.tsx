import Link from "next/link";
import { notFound } from "next/navigation";
import { verifyAdmin } from "@/lib/auth/verify-admin";
import { SupabaseClientRepository } from "@/features/clients/infrastructure/supabase-client.repository";
import { getClientByIdUseCase } from "@/features/clients/application/get-client-by-id.use-case";
import { getProjectsByClientIdUseCase } from "@/features/projects/application/get-projects-by-client-id.use-case";
import { SupabaseProjectRepository } from "@/features/projects/infrastructure/supabase-project.repository";
import { ClientStatusBadge } from "@/components/admin/client-status-badge";
import { ProjectStatusBadge } from "@/components/admin/project-status-badge";
import { signOutAction } from "@/server/actions/auth.action";

export const metadata = { title: "Cliente — Admin", robots: { index: false, follow: false } };

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div>
      <dt className="mb-0.5 text-xs text-slate-500">{label}</dt>
      <dd className="text-sm text-slate-200 break-words">{value}</dd>
    </div>
  );
}

export default async function AdminClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await verifyAdmin();

  const { id } = await params;

  const repository = new SupabaseClientRepository();
  const result      = await getClientByIdUseCase(id, repository);

  if (!result.ok) notFound();

  const { client } = result;

  const projectsResult = await getProjectsByClientIdUseCase(id, new SupabaseProjectRepository());

  return (
    <div className="min-h-screen px-6 py-10">
      <div className="mx-auto max-w-2xl space-y-6">

        {/* Nav */}
        <div className="flex items-center justify-between">
          <Link
            href="/admin/clients"
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
              <h1 className="text-xl font-semibold text-slate-50 break-words">{client.name}</h1>
              {client.company && (
                <p className="mt-1 text-sm text-slate-400 break-words">{client.company}</p>
              )}
            </div>
            <ClientStatusBadge status={client.status} />
          </div>
        </div>

        {/* Datos */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 sm:p-6">
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Contacto principal" value={client.contactName} />
            <Field label="Email de contacto"  value={client.contactEmail} />
            <Field label="Teléfono / WhatsApp" value={client.contactPhone} />
            <Field label="Rubro"              value={client.industry} />
            <Field label="Creado"             value={new Date(client.createdAt).toLocaleString("es-AR")} />
            <Field label="Actualizado"        value={new Date(client.updatedAt).toLocaleString("es-AR")} />
          </dl>

          {client.notes && (
            <div className="mt-6 border-t border-slate-800 pt-6">
              <Field label="Notas internas" value={client.notes} />
            </div>
          )}
        </div>

        {/* Proyectos */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500">
              Proyectos
            </h2>
            <Link
              href={`/admin/projects/new?clientId=${client.id}`}
              className="text-xs text-cyan-400 transition-colors hover:text-cyan-300"
            >
              Crear proyecto
            </Link>
          </div>

          {!projectsResult.ok ? (
            <p className="text-sm text-red-400">{projectsResult.error}</p>
          ) : projectsResult.projects.length === 0 ? (
            <p className="text-sm text-slate-600">Este cliente todavía no tiene proyectos.</p>
          ) : (
            <ul className="space-y-2">
              {projectsResult.projects.map((project) => (
                <li
                  key={project.id}
                  className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/60 px-4 py-3"
                >
                  <Link
                    href={`/admin/projects/${project.id}`}
                    className="text-sm font-medium text-slate-100 hover:text-cyan-400"
                  >
                    {project.name}
                  </Link>
                  <ProjectStatusBadge status={project.status} />
                </li>
              ))}
            </ul>
          )}
        </div>

      </div>
    </div>
  );
}
