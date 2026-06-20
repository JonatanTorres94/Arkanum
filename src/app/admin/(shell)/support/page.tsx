import Link from "next/link";
import { getSupportTicketsUseCase } from "@/features/support/application/get-support-tickets.use-case";
import { SupabaseSupportTicketRepository } from "@/features/support/infrastructure/supabase-support-ticket.repository";
import { getClientsUseCase } from "@/features/clients/application/get-clients.use-case";
import { SupabaseClientRepository } from "@/features/clients/infrastructure/supabase-client.repository";
import { getProjectsUseCase } from "@/features/projects/application/get-projects.use-case";
import { SupabaseProjectRepository } from "@/features/projects/infrastructure/supabase-project.repository";
import { TicketStatusBadge, TicketPriorityBadge, TicketCategoryBadge } from "@/components/admin/support-ticket-badges";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminEmptyState } from "@/components/admin/admin-empty-state";

export const metadata = { title: "Soporte — Admin", robots: { index: false, follow: false } };

export default async function AdminSupportPage() {
  const [ticketsResult, clientsResult, projectsResult] = await Promise.all([
    getSupportTicketsUseCase(new SupabaseSupportTicketRepository()),
    getClientsUseCase(new SupabaseClientRepository()),
    getProjectsUseCase(new SupabaseProjectRepository()),
  ]);

  const clientNameById  = new Map(clientsResult.ok  ? clientsResult.clients.map((c) => [c.id, c.name])   : []);
  const projectNameById = new Map(projectsResult.ok ? projectsResult.projects.map((p) => [p.id, p.name]) : []);

  return (
    <div>
      <AdminPageHeader
        title="Soporte"
        count={ticketsResult.ok ? ticketsResult.tickets.length : undefined}
        action={
          <Link
            href="/admin/support/new"
            className="rounded-lg border border-admin-border-strong px-4 py-2 text-sm text-admin-text-secondary transition-colors hover:border-admin-accent hover:text-admin-text"
          >
            Crear ticket
          </Link>
        }
      />

      <div className="px-6 py-6">
        {!ticketsResult.ok ? (
          <p className="text-sm text-admin-danger">{ticketsResult.error}</p>

        ) : ticketsResult.tickets.length === 0 ? (
          <AdminEmptyState message="Todavía no hay tickets de soporte registrados." />

        ) : (
          <div className="overflow-x-auto rounded-xl border border-admin-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-admin-border bg-admin-surface-hover">
                  <th className="px-4 py-3 text-left font-medium text-admin-text-muted">Título</th>
                  <th className="px-4 py-3 text-left font-medium text-admin-text-muted">Cliente</th>
                  <th className="hidden px-4 py-3 text-left font-medium text-admin-text-muted md:table-cell">Proyecto</th>
                  <th className="px-4 py-3 text-left font-medium text-admin-text-muted">Estado</th>
                  <th className="hidden px-4 py-3 text-left font-medium text-admin-text-muted sm:table-cell">Prioridad</th>
                  <th className="hidden px-4 py-3 text-left font-medium text-admin-text-muted lg:table-cell">Categoría</th>
                  <th className="hidden px-4 py-3 text-left font-medium text-admin-text-muted sm:table-cell">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {ticketsResult.tickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    className="border-b border-admin-border transition-colors last:border-0 hover:bg-admin-surface-hover"
                  >
                    <td className="px-4 py-3.5">
                      <Link
                        href={`/admin/support/${ticket.id}`}
                        className="font-medium text-admin-text hover:text-admin-accent"
                      >
                        {ticket.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3.5 text-admin-text-secondary">
                      {clientNameById.get(ticket.clientId) ?? "—"}
                    </td>
                    <td className="hidden px-4 py-3.5 text-admin-text-secondary md:table-cell">
                      {ticket.projectId ? (projectNameById.get(ticket.projectId) ?? "—") : "—"}
                    </td>
                    <td className="px-4 py-3.5">
                      <TicketStatusBadge status={ticket.status} />
                    </td>
                    <td className="hidden px-4 py-3.5 sm:table-cell">
                      <TicketPriorityBadge priority={ticket.priority} />
                    </td>
                    <td className="hidden px-4 py-3.5 lg:table-cell">
                      <TicketCategoryBadge category={ticket.category} />
                    </td>
                    <td className="hidden px-4 py-3.5 text-admin-text-faint sm:table-cell">
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
