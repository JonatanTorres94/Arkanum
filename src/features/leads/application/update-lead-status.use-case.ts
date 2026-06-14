import type { LeadStatus, UpdateLeadStatusResult } from "@/features/leads/domain/lead.types";
import type { LeadRepository } from "@/features/leads/infrastructure/lead.repository";

export async function updateLeadStatusUseCase(
  id: string,
  status: LeadStatus,
  repository: LeadRepository
): Promise<UpdateLeadStatusResult> {
  try {
    await repository.updateStatus(id, status);
    return { ok: true };
  } catch {
    return { ok: false, error: "No se pudo actualizar el estado del lead." };
  }
}
