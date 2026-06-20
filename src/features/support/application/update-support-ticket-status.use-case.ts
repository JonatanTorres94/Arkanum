import type {
  UpdateSupportTicketStatusInput,
  UpdateSupportTicketStatusResult,
} from "@/features/support/domain/support-ticket.types";
import type { SupportTicketRepository } from "@/features/support/infrastructure/support-ticket.repository";

export async function updateSupportTicketStatusUseCase(
  id: string,
  input: UpdateSupportTicketStatusInput,
  repository: SupportTicketRepository
): Promise<UpdateSupportTicketStatusResult> {
  try {
    await repository.updateStatus(id, input);
    return { ok: true };
  } catch {
    return { ok: false, error: "No se pudo actualizar el estado del ticket." };
  }
}
