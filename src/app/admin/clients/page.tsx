import Link from "next/link";
import { verifyAdmin } from "@/lib/auth/verify-admin";
import { getClientsUseCase } from "@/features/clients/application/get-clients.use-case";
import { SupabaseClientRepository } from "@/features/clients/infrastructure/supabase-client.repository";
import { ClientStatusBadge } from "@/components/admin/client-status-badge";
import { signOutAction } from "@/server/actions/auth.action";

export const metadata = { title: "Clientes — Admin", robots: { index: false, follow: false } };

export default async function AdminClientsPage() {
  await verifyAdmin();

  const repository = new SupabaseClientRepository();
  const result     = await getClientsUseCase(repository);

  return (
    <div className="min-h-screen px-6 py-10">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-slate-50">
            Clientes
            {result.ok && (
              <span className="ml-2 text-base font-normal text-slate-500">
                ({result.clients.length})
              </span>
            )}
          </h1>
          <div className="flex items-center gap-5">
            <Link
              href="/admin/clients/new"
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition-colors hover:border-slate-500 hover:text-slate-100"
            >
              Crear cliente
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
        {!result.ok ? (
          <p className="text-sm text-red-400">{result.error}</p>

        ) : result.clients.length === 0 ? (
          <div className="rounded-xl border border-slate-800 bg-slate-900/20 px-6 py-14 text-center">
            <p className="text-sm text-slate-400">Todavía no hay clientes registrados.</p>
          </div>

        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/60">
                  <th className="px-4 py-3 text-left font-medium text-slate-400">Nombre</th>
                  <th className="hidden px-4 py-3 text-left font-medium text-slate-400 md:table-cell">Empresa</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-400">Estado</th>
                  <th className="hidden px-4 py-3 text-left font-medium text-slate-400 sm:table-cell">Contacto</th>
                  <th className="hidden px-4 py-3 text-left font-medium text-slate-400 sm:table-cell">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {result.clients.map((client) => (
                  <tr
                    key={client.id}
                    className="border-b border-slate-800/60 transition-colors last:border-0 hover:bg-slate-900/40"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/clients/${client.id}`}
                        className="font-medium text-slate-100 hover:text-cyan-400"
                      >
                        {client.name}
                      </Link>
                    </td>
                    <td className="hidden px-4 py-3 text-slate-400 md:table-cell">
                      {client.company ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <ClientStatusBadge status={client.status} />
                    </td>
                    <td className="hidden px-4 py-3 text-slate-400 sm:table-cell">
                      {client.contactName ?? client.contactEmail ?? "—"}
                    </td>
                    <td className="hidden px-4 py-3 text-slate-500 sm:table-cell">
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
