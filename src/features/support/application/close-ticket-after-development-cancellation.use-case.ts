import type { SupportTicketRepository } from "@/features/support/infrastructure/support-ticket.repository";
import type { SupportTicketNoteRepository } from "@/features/support/infrastructure/support-ticket-note.repository";

const TERMINAL_STATUSES = new Set(["resolved", "cancelled"]);
const NOTE_CONTENT      = "Soporte cerró el ticket después de la cancelación del trabajo de Desarrollo.";

export type CloseTicketAfterDevelopmentCancellationResult =
  | { ok: true; warning?: string }
  | { ok: false; error: string };

export async function closeTicketAfterDevelopmentCancellationUseCase(
  ticketId: string,
  authorEmail: string | null,
  ticketRepository: SupportTicketRepository,
  noteRepository: SupportTicketNoteRepository
): Promise<CloseTicketAfterDevelopmentCancellationResult> {
  try {
    const ticket = await ticketRepository.findById(ticketId);
    if (!ticket) return { ok: false, error: "Ticket no encontrado." };

    if (TERMINAL_STATUSES.has(ticket.status)) {
      return { ok: false, error: "No se puede cerrar un ticket resuelto o cancelado." };
    }

    // Idempotent: already closed → return ok without duplicating the note.
    if (ticket.status === "closed") return { ok: true };

    await ticketRepository.updateStatus(ticketId, {
      status:     "closed",
      resolvedAt: null,
    });
  } catch {
    return { ok: false, error: "No se pudo cerrar el ticket." };
  }

  // Note creation is best-effort: failure becomes a warning, not a rollback.
  try {
    await noteRepository.create(ticketId, NOTE_CONTENT, authorEmail);
  } catch {
    return {
      ok: true,
      warning:
        "El ticket se cerró, pero no se pudo registrar la nota automática — revisalo manualmente.",
    };
  }

  return { ok: true };
}
