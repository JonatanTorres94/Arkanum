import type {
  EscalateSupportTicketInput,
  EscalateSupportTicketResult,
} from "@/features/support/domain/support-ticket.types";
import { TERMINAL_TICKET_STATUSES } from "@/features/support/domain/support-ticket-attachment.types";
import type { SupportTicketRepository } from "@/features/support/infrastructure/support-ticket.repository";

// Persists escalation metadata on the ticket. Also performs a terminal-status
// guard so the rule is enforceable in tests and as defense-in-depth — the
// server action performs the same check earlier (before creating the WI) to
// prevent orphaned work items.
export async function escalateSupportTicketUseCase(
  id: string,
  input: EscalateSupportTicketInput,
  repository: SupportTicketRepository
): Promise<EscalateSupportTicketResult> {
  try {
    const ticket = await repository.findById(id);
    if (!ticket) return { ok: false, error: "Ticket no encontrado." };

    if (TERMINAL_TICKET_STATUSES.has(ticket.status)) {
      return {
        ok:    false,
        error: "No se puede escalar a desarrollo un ticket resuelto, cerrado o cancelado.",
      };
    }

    await repository.escalate(id, input);
    return { ok: true };
  } catch {
    return { ok: false, error: "No se pudo registrar la escalación del ticket." };
  }
}
