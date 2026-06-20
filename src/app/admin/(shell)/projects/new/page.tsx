import Link from "next/link";
import { getClientsUseCase } from "@/features/clients/application/get-clients.use-case";
import { SupabaseClientRepository } from "@/features/clients/infrastructure/supabase-client.repository";
import { ProjectCreateForm } from "@/components/admin/project-create-form";
import { AdminEmptyState } from "@/components/admin/admin-empty-state";

export const metadata = { title: "Nuevo proyecto — Admin", robots: { index: false, follow: false } };

export default async function AdminProjectNewPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params          = await searchParams;
  const defaultClientId = typeof params.clientId === "string" ? params.clientId : undefined;

  const clientsResult = await getClientsUseCase(new SupabaseClientRepository());

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <Link
        href="/admin/projects"
        className="mb-8 inline-block text-sm text-admin-text-muted transition-colors hover:text-admin-text"
      >
        ← Volver al listado
      </Link>

      <h1 className="mb-6 text-xl font-semibold text-admin-text">Crear proyecto</h1>

      {!clientsResult.ok ? (
        <p className="text-sm text-admin-danger">{clientsResult.error}</p>
      ) : clientsResult.clients.length === 0 ? (
        <AdminEmptyState
          message="Todavía no hay clientes registrados. Un proyecto siempre pertenece a un cliente."
          action={
            <Link
              href="/admin/clients/new"
              className="text-sm text-admin-accent transition-colors hover:underline"
            >
              Crear el primer cliente
            </Link>
          }
        />
      ) : (
        <ProjectCreateForm clients={clientsResult.clients} defaultClientId={defaultClientId} />
      )}
    </div>
  );
}
