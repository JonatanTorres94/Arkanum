import type { SupportTicket } from "@/features/support/domain/support-ticket.types";
import type { SupportTicketRepository } from "@/features/support/infrastructure/support-ticket.repository";

export type GetSupportTicketByWorkItemResult =
  | { ok: true; ticket: SupportTicket | null }
  | { ok: false; error: string };

export async function getSupportTicketByWorkItemUseCase(
  workItemId: string,
  repository: SupportTicketRepository
): Promise<GetSupportTicketByWorkItemResult> {
  try {
    const ticket = await repository.findByEscalatedWorkItemId(workItemId);
    return { ok: true, ticket };
  } catch {
    return { ok: false, error: "No se pudo cargar el ticket vinculado." };
  }
}
