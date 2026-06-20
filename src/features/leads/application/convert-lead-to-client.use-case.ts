import type { ConvertLeadToClientInput, ConvertLeadToClientResult } from "@/features/leads/domain/lead.types";
import type { LeadRepository } from "@/features/leads/infrastructure/lead.repository";

// Only persists the conversion metadata on the lead itself — creating the
// client (and, optionally, the project) are separate use-cases/repositories,
// orchestrated by the server action, same pattern as escalateSupportTicketUseCase.
export async function convertLeadToClientUseCase(
  id: string,
  input: ConvertLeadToClientInput,
  repository: LeadRepository
): Promise<ConvertLeadToClientResult> {
  try {
    await repository.convertToClient(id, input);
    return { ok: true };
  } catch {
    return { ok: false, error: "No se pudo registrar la conversión del lead." };
  }
}
