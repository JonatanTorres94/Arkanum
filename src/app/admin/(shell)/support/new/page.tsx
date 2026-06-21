import Link from "next/link";
import { getClientsUseCase } from "@/features/clients/application/get-clients.use-case";
import { SupabaseClientRepository } from "@/features/clients/infrastructure/supabase-client.repository";
import { getProjectsUseCase } from "@/features/projects/application/get-projects.use-case";
import { SupabaseProjectRepository } from "@/features/projects/infrastructure/supabase-project.repository";
import { SupportTicketForm } from "@/components/admin/support-ticket-form";
import { AdminEmptyState } from "@/components/admin/admin-empty-state";

export const metadata = { title: "Nuevo ticket — Admin", robots: { index: false, follow: false } };

export default async function AdminSupportNewPage() {
  const [clientsResult, projectsResult] = await Promise.all([
    getClientsUseCase(new SupabaseClientRepository()),
    getProjectsUseCase(new SupabaseProjectRepository()),
  ]);

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <Link
        href="/admin/support"
        className="mb-8 inline-block text-sm text-admin-text-muted transition-colors hover:text-admin-text"
      >
        ← Volver al listado
      </Link>

      <h1 className="mb-6 text-xl font-semibold text-admin-text">Crear ticket</h1>

      {!clientsResult.ok ? (
        <p className="text-sm text-admin-danger">{clientsResult.error}</p>
      ) : clientsResult.clients.length === 0 ? (
        <AdminEmptyState
          message="Todavía no hay clientes registrados. Un ticket siempre pertenece a un cliente."
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
        <SupportTicketForm
          clients={clientsResult.clients}
          projects={projectsResult.ok ? projectsResult.projects.map((p) => ({ id: p.id, name: p.name, clientId: p.clientId })) : []}
        />
      )}
    </div>
  );
}
