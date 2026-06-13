"use server";

import { redirect } from "next/navigation";
import { leadSchema, type LeadFormData } from "@/features/leads/domain/lead.schema";

export async function submitDiagnosticAction(
  data: LeadFormData
): Promise<{ error: string }> {
  const result = leadSchema.safeParse(data);

  if (!result.success) {
    return { error: "Datos inválidos. Revisá el formulario." };
  }

  // v0.3.0: data is intentionally discarded here.
  // No database, no email, no side effects. Validated data is lost on redirect.
  // v0.4.0 will replace this comment with: createLeadUseCase(result.data)

  redirect("/gracias");
}
