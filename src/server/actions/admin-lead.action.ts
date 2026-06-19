"use server";

import { revalidatePath } from "next/cache";
import { getAdminUser } from "@/lib/auth/verify-admin";
import { updateLeadStatusUseCase } from "@/features/leads/application/update-lead-status.use-case";
import { updateLeadQualifiedStageUseCase } from "@/features/leads/application/update-lead-qualified-stage.use-case";
import { updateLeadFollowUpUseCase } from "@/features/leads/application/update-lead-follow-up.use-case";
import { updateLeadIntentFieldsUseCase } from "@/features/leads/application/update-lead-intent-fields.use-case";
import { getLeadByIdUseCase } from "@/features/leads/application/get-lead-by-id.use-case";
import { createLeadEventUseCase } from "@/features/leads/application/create-lead-event.use-case";
import { SupabaseLeadRepository } from "@/features/leads/infrastructure/supabase-lead.repository";
import { SupabaseEventRepository } from "@/features/leads/infrastructure/supabase-event.repository";
import {
  LEAD_STATUSES,
  QUALIFIED_STAGES,
  type LeadStatus,
  type QualifiedStage,
  type LeadIntentFieldsInput,
} from "@/features/leads/domain/lead.types";
import {
  INDUSTRY_OPTIONS,
  COMPANY_SIZE_OPTIONS,
  URGENCY_OPTIONS,
  BUDGET_OPTIONS,
} from "@/features/leads/domain/lead.schema";

// New Date() silently normalizes impossible calendar dates (e.g. 2026-02-31
// rolls over to March) instead of rejecting them, so validate the parsed
// parts round-trip back to the same date instead of trusting Date parsing.
function isValidFollowUpDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;

  const [, yearRaw, monthRaw, dayRaw] = match;
  const year  = Number(yearRaw);
  const month = Number(monthRaw);
  const day   = Number(dayRaw);

  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

// Single-string snapshot of both follow-up fields so the audit trail can
// reuse the generic from_status/to_status columns without new schema.
function formatFollowUpSnapshot(nextAction: string | null, followUpDate: string | null): string {
  if (!nextAction && !followUpDate) return "Sin acción definida";
  const parts: string[] = [];
  if (nextAction)   parts.push(`Acción: ${nextAction}`);
  if (followUpDate) parts.push(`Fecha: ${followUpDate}`);
  return parts.join(" · ");
}

// Form values arrive as plain strings, not the option tuple's literal union,
// so .includes() needs a string[]-typed view to type-check.
function isValidEnumValue<T extends string>(options: readonly T[], value: string): value is T {
  return (options as readonly string[]).includes(value);
}

function formatIntentFieldsSnapshot(
  industry: string,
  companySize: string,
  urgency: string,
  budget: string
): string {
  return `Rubro: ${industry} · Tamaño: ${companySize} · Urgencia: ${urgency} · Presupuesto: ${budget}`;
}

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

export async function updateLeadFollowUpAction(
  id: string,
  input: { nextAction: string; followUpDate: string }
): Promise<{ error?: string }> {
  const user = await getAdminUser();
  if (!user) return { error: "No autorizado." };

  if (input.followUpDate && !isValidFollowUpDate(input.followUpDate)) {
    return { error: "Fecha inválida." };
  }

  const nextAction   = input.nextAction.trim() || null;
  const followUpDate = input.followUpDate || null;

  const leadRepository  = new SupabaseLeadRepository();
  const eventRepository = new SupabaseEventRepository();

  const leadResult = await getLeadByIdUseCase(id, leadRepository);
  if (!leadResult.ok) return { error: "Lead no encontrado." };

  const previousNextAction   = leadResult.lead.nextAction;
  const previousFollowUpDate = leadResult.lead.followUpDate;

  if (previousNextAction === nextAction && previousFollowUpDate === followUpDate) {
    return {};
  }

  const outcome = await updateLeadFollowUpUseCase(
    id,
    { nextAction, followUpDate },
    leadRepository
  );
  if (!outcome.ok) return { error: outcome.error };

  const eventOutcome = await createLeadEventUseCase(
    {
      leadId:     id,
      type:       "follow_up_updated",
      fromStatus: formatFollowUpSnapshot(previousNextAction, previousFollowUpDate),
      toStatus:   formatFollowUpSnapshot(nextAction, followUpDate),
      createdBy:  user.email ?? null,
    },
    eventRepository
  );

  if (!eventOutcome.ok) {
    console.warn("[audit] Failed to record follow_up_updated event:", eventOutcome.error);
  }

  revalidatePath(`/admin/leads/${id}`);
  revalidatePath("/admin/leads");

  return {};
}

export async function updateLeadIntentFieldsAction(
  id: string,
  input: LeadIntentFieldsInput
): Promise<{ error?: string }> {
  const user = await getAdminUser();
  if (!user) return { error: "No autorizado." };

  if (!isValidEnumValue(INDUSTRY_OPTIONS, input.industry)) {
    return { error: "Rubro inválido." };
  }
  if (!isValidEnumValue(COMPANY_SIZE_OPTIONS, input.companySize)) {
    return { error: "Tamaño de empresa inválido." };
  }
  if (!isValidEnumValue(URGENCY_OPTIONS, input.urgency)) {
    return { error: "Urgencia inválida." };
  }
  if (!isValidEnumValue(BUDGET_OPTIONS, input.budget)) {
    return { error: "Presupuesto inválido." };
  }

  const leadRepository  = new SupabaseLeadRepository();
  const eventRepository = new SupabaseEventRepository();

  const leadResult = await getLeadByIdUseCase(id, leadRepository);
  if (!leadResult.ok) return { error: "Lead no encontrado." };

  const previous            = leadResult.lead;
  const previousCompanySize = previous.companySize ?? "";

  if (
    previous.industry === input.industry &&
    previousCompanySize === input.companySize &&
    previous.urgency === input.urgency &&
    previous.budget === input.budget
  ) {
    return {};
  }

  const outcome = await updateLeadIntentFieldsUseCase(id, input, leadRepository);
  if (!outcome.ok) return { error: outcome.error };

  const eventOutcome = await createLeadEventUseCase(
    {
      leadId:     id,
      type:       "intent_fields_updated",
      fromStatus: formatIntentFieldsSnapshot(
        previous.industry,
        previousCompanySize,
        previous.urgency,
        previous.budget
      ),
      toStatus: formatIntentFieldsSnapshot(
        input.industry,
        input.companySize,
        input.urgency,
        input.budget
      ),
      createdBy: user.email ?? null,
    },
    eventRepository
  );

  if (!eventOutcome.ok) {
    console.warn("[audit] Failed to record intent_fields_updated event:", eventOutcome.error);
  }

  revalidatePath(`/admin/leads/${id}`);
  revalidatePath("/admin/leads");

  return {};
}
