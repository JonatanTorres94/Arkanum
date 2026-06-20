import Link from "next/link";
import { verifyAdmin } from "@/lib/auth/verify-admin";
import { getClientsUseCase } from "@/features/clients/application/get-clients.use-case";
import { SupabaseClientRepository } from "@/features/clients/infrastructure/supabase-client.repository";
import { getProjectsUseCase } from "@/features/projects/application/get-projects.use-case";
import { SupabaseProjectRepository } from "@/features/projects/infrastructure/supabase-project.repository";
import { SupportTicketForm } from "@/components/admin/support-ticket-form";

export const metadata = { title: "Nuevo ticket — Admin", robots: { index: false, follow: false } };

export default async function AdminSupportNewPage() {
  await verifyAdmin();

  const [clientsResult, projectsResult] = await Promise.all([
    getClientsUseCase(new SupabaseClientRepository()),
    getProjectsUseCase(new SupabaseProjectRepository()),
  ]);

  return (
    <div className="min-h-screen px-6 py-10">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/admin/support"
          className="mb-8 inline-block text-sm text-slate-500 transition-colors hover:text-slate-300"
        >
          ← Volver al listado
        </Link>

        <h1 className="mb-6 text-xl font-semibold text-slate-50">Crear ticket</h1>

        {!clientsResult.ok ? (
          <p className="text-sm text-red-400">{clientsResult.error}</p>
        ) : clientsResult.clients.length === 0 ? (
          <div className="rounded-xl border border-slate-800 bg-slate-900/20 px-6 py-10 text-center">
            <p className="text-sm text-slate-400">
              Todavía no hay clientes registrados. Un ticket siempre pertenece a un cliente.
            </p>
            <Link
              href="/admin/clients/new"
              className="mt-3 inline-block text-sm text-cyan-400 transition-colors hover:text-cyan-300"
            >
              Crear el primer cliente
            </Link>
          </div>
        ) : (
          <SupportTicketForm
            clients={clientsResult.clients}
            projects={projectsResult.ok ? projectsResult.projects.map((p) => ({ id: p.id, name: p.name, clientId: p.clientId })) : []}
          />
        )}
      </div>
    </div>
  );
}
