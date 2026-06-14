"use server";

import { revalidatePath } from "next/cache";
import { getAdminUser } from "@/lib/auth/verify-admin";
import { updateLeadStatusUseCase } from "@/features/leads/application/update-lead-status.use-case";
import { SupabaseLeadRepository } from "@/features/leads/infrastructure/supabase-lead.repository";
import { LEAD_STATUSES, type LeadStatus } from "@/features/leads/domain/lead.types";

export async function updateLeadStatusAction(
  id: string,
  status: LeadStatus
): Promise<{ error?: string }> {
  const user = await getAdminUser();
  if (!user) return { error: "No autorizado." };

  if (!LEAD_STATUSES.includes(status)) return { error: "Estado inválido." };

  const repository = new SupabaseLeadRepository();
  const outcome = await updateLeadStatusUseCase(id, status, repository);

  if (!outcome.ok) return { error: outcome.error };

  revalidatePath(`/admin/leads/${id}`);
  revalidatePath("/admin/leads");

  return {};
}
