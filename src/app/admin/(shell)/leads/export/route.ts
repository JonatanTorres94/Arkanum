import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/auth/verify-admin";
import { getLeadsUseCase } from "@/features/leads/application/get-leads.use-case";
import { SupabaseLeadRepository } from "@/features/leads/infrastructure/supabase-lead.repository";
import type { Lead } from "@/features/leads/domain/lead.types";
import { deriveLeadPriority, type LeadPriority } from "@/features/leads/domain/lead-priority";

function escapeField(value: string | null | undefined): string {
  if (value == null || value === "") return "";
  const s = String(value);
  if (/[,"\r\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function leadToRow(lead: Lead): string {
  return [
    escapeField(lead.fullName),
    escapeField(lead.email),
    escapeField(lead.company),
    escapeField(lead.role),
    escapeField(lead.whatsapp),
    escapeField(lead.industry),
    escapeField(lead.companySize),
    escapeField(lead.processToImprove),
    escapeField(lead.currentProblem),
    escapeField(lead.currentTools.join("; ")),
    escapeField(lead.weeklyHoursLost),
    escapeField(lead.budget),
    escapeField(lead.urgency),
    escapeField(lead.additionalMessage),
    escapeField(lead.status),
    escapeField(lead.landingPath),
    escapeField(lead.referrer),
    escapeField(lead.utmSource),
    escapeField(lead.utmMedium),
    escapeField(lead.utmCampaign),
    escapeField(lead.utmContent),
    escapeField(lead.utmTerm),
    escapeField(
      new Date(lead.createdAt).toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    ),
  ].join(",");
}

const HEADER = [
  "Nombre",
  "Email",
  "Empresa",
  "Rol",
  "WhatsApp",
  "Rubro",
  "Tamaño",
  "Proceso operativo",
  "Problema actual",
  "Herramientas actuales",
  "Horas semanales perdidas",
  "Presupuesto",
  "Urgencia",
  "Mensaje adicional",
  "Estado",
  "Landing path",
  "Referrer",
  "UTM source",
  "UTM medium",
  "UTM campaign",
  "UTM content",
  "UTM term",
  "Fecha",
].join(",");

export async function GET(request: NextRequest) {
  await verifyAdmin();

  const params              = request.nextUrl.searchParams;
  const activeStatus         = params.get("status")         ?? "";
  const activeIndustry       = params.get("industry")       ?? "";
  const activeCompanySize    = params.get("companySize")    ?? "";
  const activeBudget         = params.get("budget")         ?? "";
  const activeUrgency        = params.get("urgency")        ?? "";
  const activeQualifiedStage = params.get("qualifiedStage") ?? "";
  const activeLandingPath    = params.get("landingPath")    ?? "";
  const activeUtmSource      = params.get("utmSource")      ?? "";
  const activePriority       = params.get("priority")       ?? "";

  const repository = new SupabaseLeadRepository();
  const result     = await getLeadsUseCase(repository);

  if (!result.ok) {
    return new NextResponse("Error al obtener leads.", { status: 500 });
  }

  const leads = result.leads.filter((lead) => {
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
    return true;
  });

  const csv      = [HEADER, ...leads.map(leadToRow)].join("\r\n");
  const filename = `leads-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type":        "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
