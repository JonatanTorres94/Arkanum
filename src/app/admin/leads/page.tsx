import { Suspense } from "react";
import Link from "next/link";
import { verifyAdmin } from "@/lib/auth/verify-admin";
import { getLeadsUseCase } from "@/features/leads/application/get-leads.use-case";
import { SupabaseLeadRepository } from "@/features/leads/infrastructure/supabase-lead.repository";
import { LeadStatusBadge } from "@/components/admin/lead-status-badge";
import { LeadFilters } from "@/components/admin/lead-filters";
import { LeadSummaryCards } from "@/components/admin/lead-summary-cards";
import { LeadOperationalMetrics } from "@/components/admin/lead-operational-metrics";
import { LeadPipelineDistribution } from "@/components/admin/lead-pipeline-distribution";
import { signOutAction } from "@/server/actions/auth.action";

export const metadata = { title: "Leads — Admin", robots: { index: false, follow: false } };

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  await verifyAdmin();

  const filters    = await searchParams;
  const repository = new SupabaseLeadRepository();
  const result     = await getLeadsUseCase(repository);

  const activeStatus         = typeof filters.status         === "string" ? filters.status         : "";
  const activeIndustry       = typeof filters.industry       === "string" ? filters.industry       : "";
  const activeCompanySize    = typeof filters.companySize    === "string" ? filters.companySize    : "";
  const activeBudget         = typeof filters.budget         === "string" ? filters.budget         : "";
  const activeUrgency        = typeof filters.urgency        === "string" ? filters.urgency        : "";
  const activeQualifiedStage = typeof filters.qualifiedStage === "string" ? filters.qualifiedStage : "";

  const hasFilters = !!(
    activeStatus || activeIndustry || activeCompanySize || activeBudget || activeUrgency || activeQualifiedStage
  );

  const exportParams = new URLSearchParams();
  if (activeStatus)         exportParams.set("status",         activeStatus);
  if (activeIndustry)       exportParams.set("industry",       activeIndustry);
  if (activeCompanySize)    exportParams.set("companySize",    activeCompanySize);
  if (activeBudget)         exportParams.set("budget",         activeBudget);
  if (activeUrgency)        exportParams.set("urgency",        activeUrgency);
  if (activeQualifiedStage) exportParams.set("qualifiedStage", activeQualifiedStage);
  const exportHref = `/admin/leads/export${exportParams.size > 0 ? `?${exportParams.toString()}` : ""}`;

  const filteredLeads = result.ok
    ? result.leads.filter((lead) => {
        if (activeStatus      && lead.status      !== activeStatus)      return false;
        if (activeIndustry    && lead.industry    !== activeIndustry)    return false;
        if (activeCompanySize && lead.companySize !== activeCompanySize) return false;
        if (activeBudget      && lead.budget      !== activeBudget)      return false;
        if (activeUrgency     && lead.urgency     !== activeUrgency)     return false;
        // A qualified-stage filter only ever matches qualified leads —
        // "unassigned" means qualified but without a stage yet.
        if (activeQualifiedStage) {
          if (lead.status !== "qualified") return false;
          if (activeQualifiedStage === "unassigned") {
            if (lead.qualifiedStage !== null) return false;
          } else if (lead.qualifiedStage !== activeQualifiedStage) {
            return false;
          }
        }
        return true;
      })
    : [];

  return (
    <div className="min-h-screen px-6 py-10">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-slate-50">
            Leads
            {result.ok && (
              <span className="ml-2 text-base font-normal text-slate-500">
                {hasFilters
                  ? `(${filteredLeads.length} de ${result.leads.length})`
                  : `(${result.leads.length})`}
              </span>
            )}
          </h1>
          <div className="flex items-center gap-5">
            {result.ok && result.leads.length > 0 && (
              <a
                href={exportHref}
                className="text-sm text-slate-500 transition-colors hover:text-slate-300"
              >
                Exportar CSV{hasFilters ? " (filtrado)" : ""}
              </a>
            )}
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

        {/* Operational metrics */}
        {result.ok && result.leads.length > 0 && (
          <div className="mb-6 space-y-4">
            <LeadOperationalMetrics leads={result.leads} />
            <LeadPipelineDistribution leads={result.leads} />
          </div>
        )}

        {/* Summary */}
        {result.ok && result.leads.length > 0 && (
          <div className="mb-6">
            <LeadSummaryCards leads={result.leads} />
          </div>
        )}

        {/* Filters */}
        {result.ok && result.leads.length > 0 && (
          <div className="mb-6">
            <Suspense>
              <LeadFilters />
            </Suspense>
          </div>
        )}

        {/* Content */}
        {!result.ok ? (
          <p className="text-sm text-red-400">{result.error}</p>

        ) : result.leads.length === 0 ? (
          <div className="rounded-xl border border-slate-800 bg-slate-900/20 px-6 py-14 text-center">
            <p className="text-sm text-slate-400">Todavía no hay leads registrados.</p>
            <p className="mt-1 text-xs text-slate-600">
              Cuando alguien complete el formulario de diagnóstico, va a aparecer aquí.
            </p>
          </div>

        ) : filteredLeads.length === 0 ? (
          <div className="rounded-xl border border-slate-800 bg-slate-900/20 px-6 py-14 text-center">
            <p className="text-sm text-slate-400">
              No hay leads que coincidan con los filtros seleccionados.
            </p>
            <Link
              href="/admin/leads"
              className="mt-3 inline-block text-xs text-cyan-400 transition-colors hover:text-cyan-300"
            >
              Limpiar filtros
            </Link>
          </div>

        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/60">
                  <th className="px-4 py-3 text-left font-medium text-slate-400">Nombre</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-400">Estado</th>
                  <th className="hidden px-4 py-3 text-left font-medium text-slate-400 md:table-cell">Presupuesto</th>
                  <th className="hidden px-4 py-3 text-left font-medium text-slate-400 lg:table-cell">Urgencia</th>
                  <th className="hidden px-4 py-3 text-left font-medium text-slate-400 md:table-cell">Rubro</th>
                  <th className="hidden px-4 py-3 text-left font-medium text-slate-400 xl:table-cell">Tamaño</th>
                  <th className="hidden px-4 py-3 text-left font-medium text-slate-400 sm:table-cell">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead) => (
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
                      {lead.company && (
                        <span className="mt-0.5 block text-xs text-slate-500">{lead.company}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <LeadStatusBadge status={lead.status} />
                    </td>
                    <td className="hidden px-4 py-3 text-slate-400 md:table-cell">
                      {lead.budget}
                    </td>
                    <td className="hidden px-4 py-3 text-slate-400 lg:table-cell">
                      {lead.urgency}
                    </td>
                    <td className="hidden px-4 py-3 text-slate-400 md:table-cell">
                      {lead.industry}
                    </td>
                    <td className="hidden px-4 py-3 text-slate-400 xl:table-cell">
                      {lead.companySize}
                    </td>
                    <td className="hidden px-4 py-3 text-slate-500 sm:table-cell">
                      {new Date(lead.createdAt).toLocaleDateString("es-AR", {
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
