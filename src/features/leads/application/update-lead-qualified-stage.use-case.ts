import type { QualifiedStage, UpdateLeadQualifiedStageResult } from "@/features/leads/domain/lead.types";
import type { LeadRepository } from "@/features/leads/infrastructure/lead.repository";

export async function updateLeadQualifiedStageUseCase(
  id: string,
  stage: QualifiedStage | null,
  repository: LeadRepository
): Promise<UpdateLeadQualifiedStageResult> {
  try {
    await repository.updateQualifiedStage(id, stage);
    return { ok: true };
  } catch {
    return { ok: false, error: "No se pudo actualizar la etapa del lead." };
  }
}
