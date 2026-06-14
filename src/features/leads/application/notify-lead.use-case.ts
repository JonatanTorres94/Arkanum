import { resend } from "@/lib/email/resend";
import type { LeadFormData } from "@/features/leads/domain/lead.schema";

export async function notifyLeadUseCase(input: LeadFormData): Promise<void> {
  const to = process.env.LEAD_NOTIFICATION_TO;
  const from = process.env.LEAD_NOTIFICATION_FROM;

  if (!to || !from) {
    console.warn("[notify-lead] Missing LEAD_NOTIFICATION_TO or LEAD_NOTIFICATION_FROM");
    return;
  }

  const { error } = await resend.emails.send({
    from,
    to,
    subject: `Nuevo lead: ${input.fullName} — ${input.industry}`,
    text: [
      `Nombre: ${input.fullName}`,
      `Email: ${input.email}`,
      input.company ? `Empresa: ${input.company}` : null,
      input.role ? `Rol: ${input.role}` : null,
      input.whatsapp ? `WhatsApp: ${input.whatsapp}` : null,
      `Industria: ${input.industry}`,
      `Proceso a mejorar: ${input.processToImprove}`,
      `Problema actual: ${input.currentProblem}`,
      `Urgencia: ${input.urgency}`,
      `Presupuesto: ${input.budget}`,
      input.companySize ? `Tamaño de empresa: ${input.companySize}` : null,
      input.currentTools?.length ? `Herramientas actuales: ${input.currentTools.join(", ")}` : null,
      input.weeklyHoursLost ? `Horas perdidas por semana: ${input.weeklyHoursLost}` : null,
      input.additionalMessage ? `Mensaje adicional: ${input.additionalMessage}` : null,
    ]
      .filter(Boolean)
      .join("\n"),
  });

  if (error) {
    console.error("[notify-lead] Failed to send email:", error);
  }
}
