import type { LeadFormData } from "@/features/leads/domain/lead.schema";
import type { LeadRepository } from "@/features/leads/infrastructure/lead.repository";
import type { CreateLeadResult } from "@/features/leads/domain/lead.types";

export async function createLeadUseCase(
  input: LeadFormData,
  repository: LeadRepository
): Promise<CreateLeadResult> {
  try {
    const { id } = await repository.create(input);
    return { ok: true, id };
  } catch {
    return {
      ok: false,
      error:
        "No pudimos registrar tu solicitud en este momento. Intentá nuevamente en unos minutos.",
    };
  }
}
