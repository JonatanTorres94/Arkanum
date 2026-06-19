import Link from "next/link";
import { notFound } from "next/navigation";
import { verifyAdmin } from "@/lib/auth/verify-admin";
import { getProjectByIdUseCase } from "@/features/projects/application/get-project-by-id.use-case";
import { SupabaseProjectRepository } from "@/features/projects/infrastructure/supabase-project.repository";
import { getClientByIdUseCase } from "@/features/clients/application/get-client-by-id.use-case";
import { SupabaseClientRepository } from "@/features/clients/infrastructure/supabase-client.repository";
import { ProjectStatusBadge } from "@/components/admin/project-status-badge";
import { signOutAction } from "@/server/actions/auth.action";

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

  const clientResult = await getClientByIdUseCase(project.clientId, new SupabaseClientRepository());

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

      </div>
    </div>
  );
}
