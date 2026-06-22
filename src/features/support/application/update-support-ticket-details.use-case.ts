import type {
  UpdateSupportTicketDetailsInput,
  UpdateSupportTicketDetailsResult,
} from "@/features/support/domain/support-ticket.types";
import type { SupportTicketRepository } from "@/features/support/infrastructure/support-ticket.repository";

export async function updateSupportTicketDetailsUseCase(
  id: string,
  input: UpdateSupportTicketDetailsInput,
  repository: SupportTicketRepository
): Promise<UpdateSupportTicketDetailsResult> {
  try {
    await repository.updateDetails(id, input);
    return { ok: true };
  } catch {
    return { ok: false, error: "No se pudo actualizar el ticket." };
  }
}
