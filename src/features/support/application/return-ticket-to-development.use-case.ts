import type { SupportTicketRepository } from "@/features/support/infrastructure/support-ticket.repository";
import type { SupportTicketNoteRepository } from "@/features/support/infrastructure/support-ticket-note.repository";

// Note content for the support audit trail. Reason is optional; when absent
// a generic fallback is used so the note is always self-explanatory.
function buildNoteContent(reason: string | null): string {
  return reason
    ? `Soporte devolvió el caso a Desarrollo: ${reason}`
    : "Soporte devolvió el caso a Desarrollo para una nueva revisión.";
}

export type ReturnTicketToDevelopmentResult =
  | { ok: true; warning?: string }
  | { ok: false; error: string };

// Updates the ticket status to escalated_to_development and adds the support note.
// The work-item status update and lifecycle sync are handled by the action before
// calling this use case, so this function only touches the ticket aggregate.
export async function returnTicketToDevelopmentUseCase(
  ticketId: string,
  reason: string | null,
  authorEmail: string | null,
  ticketRepository: SupportTicketRepository,
  noteRepository: SupportTicketNoteRepository
): Promise<ReturnTicketToDevelopmentResult> {
  try {
    await ticketRepository.updateStatus(ticketId, {
      status:     "escalated_to_development",
      resolvedAt: null,
    });
  } catch {
    return { ok: false, error: "El work item se devolvió a Desarrollo, pero no se pudo sincronizar el estado del ticket — revisalo manualmente." };
  }

  // Note is best-effort after the ticket status is already persisted.
  try {
    await noteRepository.create(ticketId, buildNoteContent(reason), authorEmail);
  } catch {
    return {
      ok: true,
      warning:
        "El caso se devolvió a Desarrollo, pero no se pudo agregar la nota explicativa — revisalo manualmente.",
    };
  }

  return { ok: true };
}
