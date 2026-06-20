"use server";

import { revalidatePath } from "next/cache";
import { getAdminUser } from "@/lib/auth/verify-admin";
import { updateLeadStatusUseCase } from "@/features/leads/application/update-lead-status.use-case";
import { updateLeadQualifiedStageUseCase } from "@/features/leads/application/update-lead-qualified-stage.use-case";
import { updateLeadFollowUpUseCase } from "@/features/leads/application/update-lead-follow-up.use-case";
import { updateLeadIntentFieldsUseCase } from "@/features/leads/application/update-lead-intent-fields.use-case";
import { convertLeadToClientUseCase } from "@/features/leads/application/convert-lead-to-client.use-case";
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
import { isValidCalendarDate } from "@/lib/validation/calendar-date";
import { createClientUseCase } from "@/features/clients/application/create-client.use-case";
import { SupabaseClientRepository } from "@/features/clients/infrastructure/supabase-client.repository";
import { createProjectUseCase } from "@/features/projects/application/create-project.use-case";
import { SupabaseProjectRepository } from "@/features/projects/infrastructure/supabase-project.repository";
import type { ProjectStatus } from "@/features/projects/domain/project.types";

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

  if (input.followUpDate && !isValidCalendarDate(input.followUpDate)) {
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

function isEligibleForConversion(lead: { status: LeadStatus; qualifiedStage: QualifiedStage | null; convertedToClient: boolean }): boolean {
  return (
    !lead.convertedToClient &&
    lead.status === "qualified" &&
    (lead.qualifiedStage === "accepted" || lead.qualifiedStage === "project_started")
  );
}

export async function convertLeadToClientAction(
  id: string,
  input: { createProject: boolean; projectName: string; projectStatus: string }
): Promise<{ error?: string }> {
  const user = await getAdminUser();
  if (!user) return { error: "No autorizado." };

  const leadRepository = new SupabaseLeadRepository();
  const leadResult = await getLeadByIdUseCase(id, leadRepository);
  if (!leadResult.ok) return { error: "Lead no encontrado." };

  const { lead } = leadResult;

  if (lead.convertedToClient) {
    return { error: "Este lead ya fue convertido a cliente." };
  }
  if (!isEligibleForConversion(lead)) {
    return { error: "Este lead no cumple los requisitos para convertirse en cliente." };
  }

  const eventRepository = new SupabaseEventRepository();

  const clientName = lead.fullName || lead.company || "Cliente sin nombre";
  const clientResult = await createClientUseCase(
    {
      name:         clientName,
      company:      lead.company,
      contactName:  lead.fullName,
      contactEmail: lead.email,
      contactPhone: lead.whatsapp,
      industry:     lead.industry,
      status:       "active",
      notes:        `Cliente creado a partir del lead "${lead.fullName}" (#${lead.id}).`,
    },
    new SupabaseClientRepository()
  );

  if (!clientResult.ok) return { error: clientResult.error };

  const clientEventOutcome = await createLeadEventUseCase(
    {
      leadId:     id,
      type:       "converted_to_client",
      fromStatus: null,
      toStatus:   `Cliente creado: ${clientName} (#${clientResult.id})`,
      createdBy:  user.email ?? null,
    },
    eventRepository
  );
  if (!clientEventOutcome.ok) {
    console.warn("[audit] Failed to record converted_to_client event:", clientEventOutcome.error);
  }

  let projectId: string | null = null;
  let projectCreationFailed = false;

  if (input.createProject) {
    const projectName   = input.projectName.trim() || lead.processToImprove;
    const projectStatus: ProjectStatus = input.projectStatus === "discovery" ? "discovery" : "planning";

    const projectResult = await createProjectUseCase(
      {
        clientId:    clientResult.id,
        name:        projectName,
        description: lead.currentProblem,
        status:      projectStatus,
        startDate:   null,
        targetDate:  null,
        notes:       `Proyecto creado a partir del lead "${lead.fullName}" (#${lead.id}).`,
      },
      new SupabaseProjectRepository()
    );

    if (projectResult.ok) {
      projectId = projectResult.id;

      const projectEventOutcome = await createLeadEventUseCase(
        {
          leadId:     id,
          type:       "converted_to_project",
          fromStatus: null,
          toStatus:   `Proyecto creado: ${projectName} (#${projectResult.id})`,
          createdBy:  user.email ?? null,
        },
        eventRepository
      );
      if (!projectEventOutcome.ok) {
        console.warn("[audit] Failed to record converted_to_project event:", projectEventOutcome.error);
      }
    } else {
      // Partial failure, per design: the client stays created, the lead still
      // gets marked converted (with projectId null), and we surface a
      // controlled error below instead of losing the client silently.
      projectCreationFailed = true;
    }
  }

  const conversionOutcome = await convertLeadToClientUseCase(
    id,
    { clientId: clientResult.id, projectId, convertedBy: user.email ?? null },
    leadRepository
  );

  if (!conversionOutcome.ok) {
    return {
      error:
        `${conversionOutcome.error} El cliente ya se creó (#${clientResult.id})` +
        (projectId ? ` junto con el proyecto (#${projectId})` : "") +
        ", pero el lead no quedó marcado como convertido — revisalo manualmente.",
    };
  }

  revalidatePath(`/admin/leads/${id}`);
  revalidatePath("/admin/clients");
  if (projectId) revalidatePath("/admin/projects");

  if (projectCreationFailed) {
    return {
      error:
        "El cliente se creó correctamente, pero no se pudo crear el proyecto inicial. " +
        "Podés crearlo manualmente desde el cliente.",
    };
  }

  return {};
}
