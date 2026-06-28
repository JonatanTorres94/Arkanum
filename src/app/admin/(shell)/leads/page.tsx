import { Suspense } from "react";
import Link from "next/link";
import { getLeadsUseCase } from "@/features/leads/application/get-leads.use-case";
import { SupabaseLeadRepository } from "@/features/leads/infrastructure/supabase-lead.repository";
import { LeadStatusBadge } from "@/components/admin/lead-status-badge";
import { LeadPriorityBadge } from "@/components/admin/lead-priority-badge";
import { LeadFilters } from "@/components/admin/lead-filters";
import { LeadSummaryCards } from "@/components/admin/lead-summary-cards";
import { LeadOperationalMetrics } from "@/components/admin/lead-operational-metrics";
import { LeadPipelineDistribution } from "@/components/admin/lead-pipeline-distribution";
import { LeadAttributionSummary } from "@/components/admin/lead-attribution-summary";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminEmptyState } from "@/components/admin/admin-empty-state";
import { deriveLeadPriority, type LeadPriority } from "@/features/leads/domain/lead-priority";
import { deriveLeadFollowUpState, type LeadFollowUpState } from "@/features/leads/domain/lead-follow-up-state";
import { LeadFollowUpStateBadge } from "@/components/admin/lead-follow-up-state-badge";

export const metadata = { title: "Leads — Admin", robots: { index: false, follow: false } };

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const filters    = await searchParams;
  const repository = new SupabaseLeadRepository();
  const result     = await getLeadsUseCase(repository);

  // Date-only string in Argentina's timezone so the follow-up state is
  // evaluated against the local calendar date, not the UTC date.
  const todayStr = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "America/Argentina/Buenos_Aires",
  }).format(new Date());

  const activeStatus         = typeof filters.status         === "string" ? filters.status         : "";
  const activeIndustry       = typeof filters.industry       === "string" ? filters.industry       : "";
  const activeCompanySize    = typeof filters.companySize    === "string" ? filters.companySize    : "";
  const activeBudget         = typeof filters.budget         === "string" ? filters.budget         : "";
  const activeUrgency        = typeof filters.urgency        === "string" ? filters.urgency        : "";
  const activeQualifiedStage = typeof filters.qualifiedStage === "string" ? filters.qualifiedStage : "";
  const activeLandingPath    = typeof filters.landingPath    === "string" ? filters.landingPath    : "";
  const activeUtmSource      = typeof filters.utmSource      === "string" ? filters.utmSource      : "";
  const activePriority       = typeof filters.priority       === "string" ? filters.priority       : "";
  const activeFollowUp       = typeof filters.followUp       === "string" ? filters.followUp       : "";

  const hasFilters = !!(
    activeStatus || activeIndustry || activeCompanySize || activeBudget ||
    activeUrgency || activeQualifiedStage || activeLandingPath || activeUtmSource ||
    activePriority || activeFollowUp
  );

  const exportParams = new URLSearchParams();
  if (activeStatus)         exportParams.set("status",         activeStatus);
  if (activeIndustry)       exportParams.set("industry",       activeIndustry);
  if (activeCompanySize)    exportParams.set("companySize",    activeCompanySize);
  if (activeBudget)         exportParams.set("budget",         activeBudget);
  if (activeUrgency)        exportParams.set("urgency",        activeUrgency);
  if (activeQualifiedStage) exportParams.set("qualifiedStage", activeQualifiedStage);
  if (activeLandingPath)    exportParams.set("landingPath",    activeLandingPath);
  if (activeUtmSource)      exportParams.set("utmSource",      activeUtmSource);
  if (activePriority)       exportParams.set("priority",       activePriority);
  if (activeFollowUp)       exportParams.set("followUp",       activeFollowUp);
  const exportHref = `/admin/leads/export${exportParams.size > 0 ? `?${exportParams.toString()}` : ""}`;

  // Dynamic options for attribution filters — unique non-null values from loaded leads
  const landingPaths = result.ok
    ? [...new Set(result.leads.map((l) => l.landingPath).filter(Boolean) as string[])]
    : [];
  const utmSources = result.ok
    ? [...new Set(result.leads.map((l) => l.utmSource).filter(Boolean) as string[])]
    : [];

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
        if (activeLandingPath && lead.landingPath !== activeLandingPath) return false;
        if (activeUtmSource   && lead.utmSource   !== activeUtmSource)   return false;
        if (activePriority    && deriveLeadPriority(lead) !== activePriority as LeadPriority) return false;
        if (activeFollowUp    && deriveLeadFollowUpState(lead, todayStr) !== activeFollowUp as LeadFollowUpState) return false;
        return true;
      })
    : [];

  return (
    <div>
      <AdminPageHeader
        title="Leads"
        count={result.ok ? (hasFilters ? filteredLeads.length : result.leads.length) : undefined}
        action={
          result.ok && result.leads.length > 0 ? (
            <a
              href={exportHref}
              className="text-sm text-admin-text-muted transition-colors hover:text-admin-text"
            >
              Exportar CSV{hasFilters ? " (filtrado)" : ""}
            </a>
          ) : undefined
        }
      />

      <div className="space-y-6 px-6 py-6">
        {/* Operational metrics */}
        {result.ok && result.leads.length > 0 && (
          <div className="space-y-4">
            <LeadOperationalMetrics leads={result.leads} />
            <LeadPipelineDistribution leads={result.leads} />
          </div>
        )}

        {/* Summary */}
        {result.ok && result.leads.length > 0 && <LeadSummaryCards leads={result.leads} />}

        {/* Attribution */}
        {result.ok && result.leads.length > 0 && (
          <LeadAttributionSummary leads={result.leads} />
        )}

        {/* Filters */}
        {result.ok && result.leads.length > 0 && (
          <Suspense>
            <LeadFilters landingPaths={landingPaths} utmSources={utmSources} />
          </Suspense>
        )}

        {/* Content */}
        {!result.ok ? (
          <p className="text-sm text-admin-danger">{result.error}</p>

        ) : result.leads.length === 0 ? (
          <AdminEmptyState message="Todavía no hay leads registrados. Cuando alguien complete el formulario de diagnóstico, va a aparecer aquí." />

        ) : filteredLeads.length === 0 ? (
          <AdminEmptyState
            message="No hay leads que coincidan con los filtros seleccionados."
            action={
              <Link
                href="/admin/leads"
                className="text-xs text-admin-accent transition-colors hover:underline"
              >
                Limpiar filtros
              </Link>
            }
          />

        ) : (
          <div className="overflow-x-auto rounded-xl border border-admin-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-admin-border bg-admin-surface-hover">
                  <th className="px-4 py-3 text-left font-medium text-admin-text-muted">Nombre</th>
                  <th className="px-4 py-3 text-left font-medium text-admin-text-muted">Estado</th>
                  <th className="px-4 py-3 text-left font-medium text-admin-text-muted">Prioridad</th>
                  <th className="hidden px-4 py-3 text-left font-medium text-admin-text-muted sm:table-cell">Seguimiento</th>
                  <th className="hidden px-4 py-3 text-left font-medium text-admin-text-muted md:table-cell">Presupuesto</th>
                  <th className="hidden px-4 py-3 text-left font-medium text-admin-text-muted lg:table-cell">Urgencia</th>
                  <th className="hidden px-4 py-3 text-left font-medium text-admin-text-muted md:table-cell">Rubro</th>
                  <th className="hidden px-4 py-3 text-left font-medium text-admin-text-muted xl:table-cell">Tamaño</th>
                  <th className="hidden px-4 py-3 text-left font-medium text-admin-text-muted sm:table-cell">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    className="border-b border-admin-border transition-colors last:border-0 hover:bg-admin-surface-hover"
                  >
                    <td className="px-4 py-3.5">
                      <Link
                        href={`/admin/leads/${lead.id}`}
                        className="font-medium text-admin-text hover:text-admin-accent"
                      >
                        {lead.fullName}
                      </Link>
                      {lead.company && (
                        <span className="mt-0.5 block text-xs text-admin-text-muted">{lead.company}</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <LeadStatusBadge status={lead.status} />
                    </td>
                    <td className="px-4 py-3.5">
                      <LeadPriorityBadge priority={deriveLeadPriority(lead)} />
                    </td>
                    <td className="hidden px-4 py-3.5 sm:table-cell">
                      <LeadFollowUpStateBadge state={deriveLeadFollowUpState(lead, todayStr)} />
                    </td>
                    <td className="hidden px-4 py-3.5 text-admin-text-secondary md:table-cell">
                      {lead.budget}
                    </td>
                    <td className="hidden px-4 py-3.5 text-admin-text-secondary lg:table-cell">
                      {lead.urgency}
                    </td>
                    <td className="hidden px-4 py-3.5 text-admin-text-secondary md:table-cell">
                      {lead.industry}
                    </td>
                    <td className="hidden px-4 py-3.5 text-admin-text-secondary xl:table-cell">
                      {lead.companySize}
                    </td>
                    <td className="hidden px-4 py-3.5 text-admin-text-faint sm:table-cell">
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
