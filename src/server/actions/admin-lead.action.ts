"use server";

import { revalidatePath } from "next/cache";
import { getAdminUser } from "@/lib/auth/verify-admin";
import { updateLeadStatusUseCase } from "@/features/leads/application/update-lead-status.use-case";
import { updateLeadQualifiedStageUseCase } from "@/features/leads/application/update-lead-qualified-stage.use-case";
import { getLeadByIdUseCase } from "@/features/leads/application/get-lead-by-id.use-case";
import { createLeadEventUseCase } from "@/features/leads/application/create-lead-event.use-case";
import { SupabaseLeadRepository } from "@/features/leads/infrastructure/supabase-lead.repository";
import { SupabaseEventRepository } from "@/features/leads/infrastructure/supabase-event.repository";
import {
  LEAD_STATUSES,
  QUALIFIED_STAGES,
  type LeadStatus,
  type QualifiedStage,
} from "@/features/leads/domain/lead.types";

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

export async function updateLeadQualifiedStageAction(
  id: string,
  stage: QualifiedStage | null
): Promise<{ error?: string }> {
  const user = await getAdminUser();
  if (!user) return { error: "No autorizado." };

  if (stage !== null && !QUALIFIED_STAGES.includes(stage)) {
    return { error: "Etapa inválida." };
  }

  const leadRepository  = new SupabaseLeadRepository();
  const eventRepository = new SupabaseEventRepository();

  const leadResult = await getLeadByIdUseCase(id, leadRepository);
  if (!leadResult.ok) return { error: "Lead no encontrado." };

  if (leadResult.lead.status !== "qualified") {
    return { error: "Solo se puede asignar una etapa a leads calificados." };
  }

  const fromStage = leadResult.lead.qualifiedStage;

  if (fromStage === stage) return {};

  const outcome = await updateLeadQualifiedStageUseCase(id, stage, leadRepository);
  if (!outcome.ok) return { error: outcome.error };

  const eventOutcome = await createLeadEventUseCase(
    {
      leadId:     id,
      type:       "qualified_stage_changed",
      fromStatus: fromStage,
      toStatus:   stage,
      createdBy:  user.email ?? null,
    },
    eventRepository
  );

  if (!eventOutcome.ok) {
    console.warn("[audit] Failed to record qualified_stage_changed event:", eventOutcome.error);
  }

  revalidatePath(`/admin/leads/${id}`);
  revalidatePath("/admin/leads");

  return {};
}
