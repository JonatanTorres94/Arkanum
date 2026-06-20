import type { SupportTicket } from "@/features/support/domain/support-ticket.types";
import type { SupportTicketRepository } from "@/features/support/infrastructure/support-ticket.repository";

export type GetSupportTicketByIdResult =
  | { ok: true; ticket: SupportTicket }
  | { ok: false; notFound: boolean; error: string };

export async function getSupportTicketByIdUseCase(
  id: string,
  repository: SupportTicketRepository
): Promise<GetSupportTicketByIdResult> {
  try {
    const ticket = await repository.findById(id);
    if (!ticket) return { ok: false, notFound: true, error: "Ticket no encontrado." };
    return { ok: true, ticket };
  } catch {
    return { ok: false, notFound: false, error: "No se pudo cargar el ticket." };
  }
}
