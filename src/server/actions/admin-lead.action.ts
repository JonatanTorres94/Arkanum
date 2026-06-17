"use server";

import { revalidatePath } from "next/cache";
import { getAdminUser } from "@/lib/auth/verify-admin";
import { updateLeadStatusUseCase } from "@/features/leads/application/update-lead-status.use-case";
import { getLeadByIdUseCase } from "@/features/leads/application/get-lead-by-id.use-case";
import { createLeadEventUseCase } from "@/features/leads/application/create-lead-event.use-case";
import { SupabaseLeadRepository } from "@/features/leads/infrastructure/supabase-lead.repository";
import { SupabaseEventRepository } from "@/features/leads/infrastructure/supabase-event.repository";
import { LEAD_STATUSES, type LeadStatus } from "@/features/leads/domain/lead.types";

export async function updateLeadStatusAction(
  id: string,
  status: LeadStatus
): Promise<{ error?: string }> {
  const user = await getAdminUser();
  if (!user) return { error: "No autorizado." };

  if (!LEAD_STATUSES.includes(status)) return { error: "Estado inválido." };

  const leadRepository  = new SupabaseLeadRepository();
  const eventRepository = new SupabaseEventRepository();

  const leadResult = await getLeadByIdUseCase(id, leadRepository);
  if (!leadResult.ok) return { error: "Lead no encontrado." };

  const fromStatus = leadResult.lead.status;

  if (fromStatus === status) return {};

  const outcome = await updateLeadStatusUseCase(id, status, leadRepository);
  if (!outcome.ok) return { error: outcome.error };

  const eventOutcome = await createLeadEventUseCase(
    {
      leadId:     id,
      type:       "status_changed",
      fromStatus,
      toStatus:   status,
      createdBy:  user.email ?? null,
    },
    eventRepository
  );

  if (!eventOutcome.ok) {
    console.warn("[audit] Failed to record status_changed event:", eventOutcome.error);
  }

  revalidatePath(`/admin/leads/${id}`);
  revalidatePath("/admin/leads");

  return {};
}
