"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { leadSchema, type LeadFormData } from "@/features/leads/domain/lead.schema";
import { createLeadUseCase } from "@/features/leads/application/create-lead.use-case";
import { notifyLeadUseCase } from "@/features/leads/application/notify-lead.use-case";
import { SupabaseLeadRepository } from "@/features/leads/infrastructure/supabase-lead.repository";
import { ResendEmailService } from "@/lib/email/resend-email-service";
import { checkRateLimit } from "@/lib/security/rate-limit";

export type DiagnosticRedirectTarget = "/gracias" | "/pt-BR/obrigado";

const ALLOWED_REDIRECTS: readonly DiagnosticRedirectTarget[] = ["/gracias", "/pt-BR/obrigado"];

export async function submitDiagnosticAction(
  data: LeadFormData,
  redirectTo: DiagnosticRedirectTarget = "/gracias"
): Promise<{ error: string }> {
  // Defense in depth: redirectTo is typed at the call site, but a raw
  // server action invocation could bypass that, so re-validate here.
  const target = ALLOWED_REDIRECTS.includes(redirectTo) ? redirectTo : "/gracias";

  const result = leadSchema.safeParse(data);

  if (!result.success) {
    return { error: "Datos inválidos. Revisá el formulario." };
  }

  // Honeypot: bots fill this field, humans don't — silent discard
  if (result.data.website) {
    redirect(target);
  }

  // Rate limit: best-effort in-memory (resets on cold start)
  const headersList = await headers();
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headersList.get("x-real-ip") ||
    "unknown";
  const { allowed } = checkRateLimit(`diagnostic:${ip}`);

  if (!allowed) {
    return {
      error:
        "No pudimos procesar tu solicitud en este momento. Intentá nuevamente más tarde.",
    };
  }

  const repository = new SupabaseLeadRepository();
  const outcome = await createLeadUseCase(result.data, repository);

  if (!outcome.ok) {
    return { error: outcome.error };
  }

  const emailService = new ResendEmailService();
  await notifyLeadUseCase(result.data, outcome.id, emailService).catch((err: unknown) => {
    console.error(
      "[diagnostic-action] Email notification error:",
      err instanceof Error ? err.message : "unknown"
    );
  });

  redirect(target);
}
