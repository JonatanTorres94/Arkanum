import type { LeadFormData } from "@/features/leads/domain/lead.schema";
import type { EmailService } from "@/lib/email/email-service";

export async function notifyLeadUseCase(
  input: LeadFormData,
  leadId: string,
  emailService: EmailService
): Promise<void> {
  const to = process.env.LEAD_NOTIFICATION_TO;
  const from = process.env.LEAD_NOTIFICATION_FROM;

  if (!to || !from) {
    console.warn("[notify-lead] Missing LEAD_NOTIFICATION_TO or LEAD_NOTIFICATION_FROM");
    return;
  }

  await emailService.send({
    from,
    to,
    subject: `Nuevo diagnóstico: ${input.fullName} — ${input.industry}`,
    text: [
      "Nuevo diagnóstico solicitado desde la web",
      "",
      `ID: ${leadId}`,
      `Nombre: ${input.fullName}`,
      `Email: ${input.email}`,
      input.company ? `Empresa: ${input.company}` : null,
      input.role ? `Rol: ${input.role}` : null,
      input.whatsapp ? `WhatsApp: ${input.whatsapp}` : null,
      `Industria: ${input.industry}`,
      `Proceso a ordenar/automatizar/integrar: ${input.processToImprove}`,
      `Problema actual: ${input.currentProblem}`,
      `Urgencia: ${input.urgency}`,
      `Presupuesto: ${input.budget}`,
      input.companySize ? `Tamaño de empresa: ${input.companySize}` : null,
      input.currentTools?.length ? `Herramientas actuales: ${input.currentTools.join(", ")}` : null,
      input.weeklyHoursLost ? `Horas perdidas por semana: ${input.weeklyHoursLost}` : null,
      input.additionalMessage ? `Mensaje adicional: ${input.additionalMessage}` : null,
      input.landingPath  ? `Landing: ${input.landingPath}`        : null,
      input.referrer     ? `Referrer: ${input.referrer}`          : null,
      input.utmSource    ? `UTM source: ${input.utmSource}`       : null,
      input.utmMedium    ? `UTM medium: ${input.utmMedium}`       : null,
      input.utmCampaign  ? `UTM campaign: ${input.utmCampaign}`   : null,
      input.utmContent   ? `UTM content: ${input.utmContent}`     : null,
      input.utmTerm      ? `UTM term: ${input.utmTerm}`           : null,
    ]
      .filter(Boolean)
      .join("\n"),
  });
}
