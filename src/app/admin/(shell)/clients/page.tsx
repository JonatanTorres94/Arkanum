import Link from "next/link";
import { getClientsUseCase } from "@/features/clients/application/get-clients.use-case";
import { SupabaseClientRepository } from "@/features/clients/infrastructure/supabase-client.repository";
import { ClientStatusBadge } from "@/components/admin/client-status-badge";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminEmptyState } from "@/components/admin/admin-empty-state";

export const metadata = { title: "Clientes — Admin", robots: { index: false, follow: false } };

export default async function AdminClientsPage() {
  const repository = new SupabaseClientRepository();
  const result     = await getClientsUseCase(repository);

  return (
    <div>
      <AdminPageHeader
        title="Clientes"
        count={result.ok ? result.clients.length : undefined}
        action={
          <Link
            href="/admin/clients/new"
            className="rounded-lg border border-admin-border-strong px-4 py-2 text-sm text-admin-text-secondary transition-colors hover:border-admin-accent hover:text-admin-text"
          >
            Crear cliente
          </Link>
        }
      />

      <div className="px-6 py-6">
        {!result.ok ? (
          <p className="text-sm text-admin-danger">{result.error}</p>

        ) : result.clients.length === 0 ? (
          <AdminEmptyState message="Todavía no hay clientes registrados." />

        ) : (
          <div className="overflow-x-auto rounded-xl border border-admin-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-admin-border bg-admin-surface-hover">
                  <th className="px-4 py-3 text-left font-medium text-admin-text-muted">Nombre</th>
                  <th className="hidden px-4 py-3 text-left font-medium text-admin-text-muted md:table-cell">Empresa</th>
                  <th className="px-4 py-3 text-left font-medium text-admin-text-muted">Estado</th>
                  <th className="hidden px-4 py-3 text-left font-medium text-admin-text-muted sm:table-cell">Contacto</th>
                  <th className="hidden px-4 py-3 text-left font-medium text-admin-text-muted sm:table-cell">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {result.clients.map((client) => (
                  <tr
                    key={client.id}
                    className="border-b border-admin-border transition-colors last:border-0 hover:bg-admin-surface-hover"
                  >
                    <td className="px-4 py-3.5">
                      <Link
                        href={`/admin/clients/${client.id}`}
                        className="font-medium text-admin-text hover:text-admin-accent"
                      >
                        {client.name}
                      </Link>
                    </td>
                    <td className="hidden px-4 py-3.5 text-admin-text-secondary md:table-cell">
                      {client.company ?? "—"}
                    </td>
                    <td className="px-4 py-3.5">
                      <ClientStatusBadge status={client.status} />
                    </td>
                    <td className="hidden px-4 py-3.5 text-admin-text-secondary sm:table-cell">
                      {client.contactName ?? client.contactEmail ?? "—"}
                    </td>
                    <td className="hidden px-4 py-3.5 text-admin-text-faint sm:table-cell">
                      {new Date(client.createdAt).toLocaleDateString("es-AR", {
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
