import type { SupportTicket } from "@/features/support/domain/support-ticket.types";
import type { SupportTicketRepository } from "@/features/support/infrastructure/support-ticket.repository";

export type GetSupportTicketsResult =
  | { ok: true; tickets: SupportTicket[] }
  | { ok: false; error: string };

export async function getSupportTicketsUseCase(
  repository: SupportTicketRepository
): Promise<GetSupportTicketsResult> {
  try {
    const tickets = await repository.findAll();
    return { ok: true, tickets };
  } catch {
    return { ok: false, error: "No se pudo cargar el listado de tickets." };
  }
}
