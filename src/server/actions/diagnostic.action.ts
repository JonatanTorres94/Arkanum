"use server";

import { redirect } from "next/navigation";
import { leadSchema, type LeadFormData } from "@/features/leads/domain/lead.schema";
import { createLeadUseCase } from "@/features/leads/application/create-lead.use-case";
import { SupabaseLeadRepository } from "@/features/leads/infrastructure/supabase-lead.repository";

export async function submitDiagnosticAction(
  data: LeadFormData
): Promise<{ error: string }> {
  const result = leadSchema.safeParse(data);

  if (!result.success) {
    return { error: "Datos inválidos. Revisá el formulario." };
  }

  const repository = new SupabaseLeadRepository();
  const outcome = await createLeadUseCase(result.data, repository);

  if (!outcome.ok) {
    return { error: outcome.error };
  }

  redirect("/gracias");
}
