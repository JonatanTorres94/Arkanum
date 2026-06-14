import Link from "next/link";
import { verifyAdmin } from "@/lib/auth/verify-admin";
import { getLeadsUseCase } from "@/features/leads/application/get-leads.use-case";
import { SupabaseLeadRepository } from "@/features/leads/infrastructure/supabase-lead.repository";
import { LeadStatusBadge } from "@/components/admin/lead-status-badge";
import { signOutAction } from "@/server/actions/auth.action";

export const metadata = { title: "Leads — Admin", robots: { index: false, follow: false } };

export default async function AdminLeadsPage() {
  await verifyAdmin();

  const repository = new SupabaseLeadRepository();
  const result = await getLeadsUseCase(repository);

  return (
    <div className="min-h-screen px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-slate-50">
            Leads
            {result.ok && (
              <span className="ml-2 text-base font-normal text-slate-500">
                ({result.leads.length})
              </span>
            )}
          </h1>
          <form action={signOutAction}>
            <button
              type="submit"
              className="text-sm text-slate-500 transition-colors hover:text-slate-300"
            >
              Cerrar sesión
            </button>
          </form>
        </div>

        {!result.ok ? (
          <p className="text-sm text-red-400">{result.error}</p>
        ) : result.leads.length === 0 ? (
          <p className="text-sm text-slate-500">Todavía no hay leads registrados.</p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-800">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/60">
                  <th className="px-4 py-3 text-left font-medium text-slate-400">Nombre</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-400">Email</th>
                  <th className="hidden px-4 py-3 text-left font-medium text-slate-400 md:table-cell">Rubro</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-400">Estado</th>
                  <th className="hidden px-4 py-3 text-left font-medium text-slate-400 sm:table-cell">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {result.leads.map((lead) => (
                  <tr
                    key={lead.id}
                    className="border-b border-slate-800/60 transition-colors last:border-0 hover:bg-slate-900/40"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/leads/${lead.id}`}
                        className="font-medium text-slate-100 hover:text-cyan-400"
                      >
                        {lead.fullName}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-400">{lead.email}</td>
                    <td className="hidden px-4 py-3 text-slate-400 md:table-cell">{lead.industry}</td>
                    <td className="px-4 py-3">
                      <LeadStatusBadge status={lead.status} />
                    </td>
                    <td className="hidden px-4 py-3 text-slate-500 sm:table-cell">
                      {new Date(lead.createdAt).toLocaleDateString("es-AR", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
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
