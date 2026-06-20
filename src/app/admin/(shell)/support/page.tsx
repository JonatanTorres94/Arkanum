import Link from "next/link";
import { verifyAdmin } from "@/lib/auth/verify-admin";
import { getSupportTicketsUseCase } from "@/features/support/application/get-support-tickets.use-case";
import { SupabaseSupportTicketRepository } from "@/features/support/infrastructure/supabase-support-ticket.repository";
import { getClientsUseCase } from "@/features/clients/application/get-clients.use-case";
import { SupabaseClientRepository } from "@/features/clients/infrastructure/supabase-client.repository";
import { getProjectsUseCase } from "@/features/projects/application/get-projects.use-case";
import { SupabaseProjectRepository } from "@/features/projects/infrastructure/supabase-project.repository";
import { TicketStatusBadge, TicketPriorityBadge, TicketCategoryBadge } from "@/components/admin/support-ticket-badges";
import { signOutAction } from "@/server/actions/auth.action";

export const metadata = { title: "Soporte — Admin", robots: { index: false, follow: false } };

export default async function AdminSupportPage() {
  await verifyAdmin();

  const [ticketsResult, clientsResult, projectsResult] = await Promise.all([
    getSupportTicketsUseCase(new SupabaseSupportTicketRepository()),
    getClientsUseCase(new SupabaseClientRepository()),
    getProjectsUseCase(new SupabaseProjectRepository()),
  ]);

  const clientNameById  = new Map(clientsResult.ok  ? clientsResult.clients.map((c) => [c.id, c.name])   : []);
  const projectNameById = new Map(projectsResult.ok ? projectsResult.projects.map((p) => [p.id, p.name]) : []);

  return (
    <div className="min-h-screen px-6 py-10">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-slate-50">
            Soporte
            {ticketsResult.ok && (
              <span className="ml-2 text-base font-normal text-slate-500">
                ({ticketsResult.tickets.length})
              </span>
            )}
          </h1>
          <div className="flex items-center gap-5">
            <Link
              href="/admin/support/new"
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition-colors hover:border-slate-500 hover:text-slate-100"
            >
              Crear ticket
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
        {!ticketsResult.ok ? (
          <p className="text-sm text-red-400">{ticketsResult.error}</p>

        ) : ticketsResult.tickets.length === 0 ? (
          <div className="rounded-xl border border-slate-800 bg-slate-900/20 px-6 py-14 text-center">
            <p className="text-sm text-slate-400">Todavía no hay tickets de soporte registrados.</p>
          </div>

        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/60">
                  <th className="px-4 py-3 text-left font-medium text-slate-400">Título</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-400">Cliente</th>
                  <th className="hidden px-4 py-3 text-left font-medium text-slate-400 md:table-cell">Proyecto</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-400">Estado</th>
                  <th className="hidden px-4 py-3 text-left font-medium text-slate-400 sm:table-cell">Prioridad</th>
                  <th className="hidden px-4 py-3 text-left font-medium text-slate-400 lg:table-cell">Categoría</th>
                  <th className="hidden px-4 py-3 text-left font-medium text-slate-400 sm:table-cell">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {ticketsResult.tickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    className="border-b border-slate-800/60 transition-colors last:border-0 hover:bg-slate-900/40"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/support/${ticket.id}`}
                        className="font-medium text-slate-100 hover:text-cyan-400"
                      >
                        {ticket.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      {clientNameById.get(ticket.clientId) ?? "—"}
                    </td>
                    <td className="hidden px-4 py-3 text-slate-400 md:table-cell">
                      {ticket.projectId ? (projectNameById.get(ticket.projectId) ?? "—") : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <TicketStatusBadge status={ticket.status} />
                    </td>
                    <td className="hidden px-4 py-3 sm:table-cell">
                      <TicketPriorityBadge priority={ticket.priority} />
                    </td>
                    <td className="hidden px-4 py-3 lg:table-cell">
                      <TicketCategoryBadge category={ticket.category} />
                    </td>
                    <td className="hidden px-4 py-3 text-slate-500 sm:table-cell">
                      {new Date(ticket.createdAt).toLocaleDateString("es-AR", {
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
