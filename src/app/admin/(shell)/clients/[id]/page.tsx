import Link from "next/link";
import { notFound } from "next/navigation";
import { SupabaseClientRepository } from "@/features/clients/infrastructure/supabase-client.repository";
import { getClientByIdUseCase } from "@/features/clients/application/get-client-by-id.use-case";
import { getProjectsByClientIdUseCase } from "@/features/projects/application/get-projects-by-client-id.use-case";
import { SupabaseProjectRepository } from "@/features/projects/infrastructure/supabase-project.repository";
import { ClientStatusBadge } from "@/components/admin/client-status-badge";
import { ProjectStatusBadge } from "@/components/admin/project-status-badge";
import { AdminSection } from "@/components/admin/admin-card";
import { AdminDetailLayout } from "@/components/admin/admin-detail-layout";

export const metadata = { title: "Cliente — Admin", robots: { index: false, follow: false } };

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div>
      <dt className="mb-0.5 text-xs text-admin-text-muted">{label}</dt>
      <dd className="text-sm text-admin-text break-words">{value}</dd>
    </div>
  );
}

export default async function AdminClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const repository = new SupabaseClientRepository();
  const result      = await getClientByIdUseCase(id, repository);

  if (!result.ok) notFound();

  const { client } = result;

  const projectsResult = await getProjectsByClientIdUseCase(id, new SupabaseProjectRepository());

  return (
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
            <ClientStatusBadge status={client.status} />
          </div>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-admin-text-faint">
            <span>Creado: {new Date(client.createdAt).toLocaleString("es-AR")}</span>
            <span>Actualizado: {new Date(client.updatedAt).toLocaleString("es-AR")}</span>
          </div>
        </div>
      }
      main={
        <AdminSection title="Proyectos">
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
          ) : projectsResult.projects.length === 0 ? (
            <p className="text-sm text-admin-text-faint">Este cliente todavía no tiene proyectos.</p>
          ) : (
            <ul className="space-y-2">
              {projectsResult.projects.map((project) => (
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
      }
      sidebar={
        <>
          <AdminSection title="Datos de contacto">
            <dl className="space-y-4">
              <Field label="Contacto principal" value={client.contactName} />
              <Field label="Email de contacto"  value={client.contactEmail} />
              <Field label="Teléfono / WhatsApp" value={client.contactPhone} />
            </dl>
          </AdminSection>

          <AdminSection title="Empresa">
            <dl className="space-y-4">
              <Field label="Rubro" value={client.industry} />
            </dl>
          </AdminSection>

          {client.notes && (
            <AdminSection title="Notas internas">
              <Field label="Notas" value={client.notes} />
            </AdminSection>
          )}
        </>
      }
    />
  );
}
