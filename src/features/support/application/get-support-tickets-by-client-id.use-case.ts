import type { SupportTicket } from "@/features/support/domain/support-ticket.types";
import type { SupportTicketRepository } from "@/features/support/infrastructure/support-ticket.repository";

export type GetSupportTicketsByClientIdResult =
  | { ok: true; tickets: SupportTicket[] }
  | { ok: false; error: string };

export async function getSupportTicketsByClientIdUseCase(
  clientId: string,
  repository: SupportTicketRepository
): Promise<GetSupportTicketsByClientIdResult> {
  try {
    const tickets = await repository.findByClientId(clientId);
    return { ok: true, tickets };
  } catch {
    return { ok: false, error: "No se pudieron cargar los tickets de soporte." };
  }
}
