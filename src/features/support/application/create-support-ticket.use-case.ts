import type { CreateSupportTicketInput, CreateSupportTicketResult } from "@/features/support/domain/support-ticket.types";
import type { SupportTicketRepository } from "@/features/support/infrastructure/support-ticket.repository";

export async function createSupportTicketUseCase(
  input: CreateSupportTicketInput,
  repository: SupportTicketRepository
): Promise<CreateSupportTicketResult> {
  try {
    const { id } = await repository.create(input);
    return { ok: true, id };
  } catch {
    return { ok: false, error: "No se pudo crear el ticket." };
  }
}
