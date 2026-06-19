import type { LeadFollowUpInput, UpdateLeadFollowUpResult } from "@/features/leads/domain/lead.types";
import type { LeadRepository } from "@/features/leads/infrastructure/lead.repository";

export async function updateLeadFollowUpUseCase(
  id: string,
  input: LeadFollowUpInput,
  repository: LeadRepository
): Promise<UpdateLeadFollowUpResult> {
  try {
    await repository.updateFollowUp(id, input);
    return { ok: true };
  } catch {
    return { ok: false, error: "No se pudo guardar el seguimiento del lead." };
  }
}
