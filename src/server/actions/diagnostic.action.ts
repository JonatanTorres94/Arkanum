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

  // v0.4.0: createLeadUseCase(result.data) — persistencia Supabase

  redirect("/gracias");
}
