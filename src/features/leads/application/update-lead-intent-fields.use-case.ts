import type { LeadIntentFieldsInput, UpdateLeadIntentFieldsResult } from "@/features/leads/domain/lead.types";
import type { LeadRepository } from "@/features/leads/infrastructure/lead.repository";

export async function updateLeadIntentFieldsUseCase(
  id: string,
  input: LeadIntentFieldsInput,
  repository: LeadRepository
): Promise<UpdateLeadIntentFieldsResult> {
  try {
    await repository.updateIntentFields(id, input);
    return { ok: true };
  } catch {
    return { ok: false, error: "No se pudieron actualizar los campos del lead." };
  }
}
