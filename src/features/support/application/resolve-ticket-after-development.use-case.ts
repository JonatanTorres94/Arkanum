import type { SupportTicketRepository } from "@/features/support/infrastructure/support-ticket.repository";
import type { SupportTicketNoteRepository } from "@/features/support/infrastructure/support-ticket-note.repository";

const TERMINAL_STATUSES = new Set(["closed", "cancelled"]);
const NOTE_CONTENT      = "Soporte validó el trabajo completado por Desarrollo y resolvió el ticket.";

export type ResolveTicketAfterDevelopmentResult =
  | { ok: true; warning?: string }
  | { ok: false; error: string };

export async function resolveTicketAfterDevelopmentUseCase(
  ticketId: string,
  authorEmail: string | null,
  ticketRepository: SupportTicketRepository,
  noteRepository: SupportTicketNoteRepository
): Promise<ResolveTicketAfterDevelopmentResult> {
  try {
    const ticket = await ticketRepository.findById(ticketId);
    if (!ticket) return { ok: false, error: "Ticket no encontrado." };

    if (TERMINAL_STATUSES.has(ticket.status)) {
      return { ok: false, error: "No se puede resolver un ticket cerrado o cancelado." };
    }

    // Idempotent: already resolved → no duplicate note.
    if (ticket.status === "resolved") return { ok: true };

    await ticketRepository.updateStatus(ticketId, {
      status:     "resolved",
      resolvedAt: new Date().toISOString(),
    });
  } catch {
    return { ok: false, error: "No se pudo resolver el ticket." };
  }

  // Note creation is best-effort: failure becomes a warning, not a rollback.
  try {
    await noteRepository.create(ticketId, NOTE_CONTENT, authorEmail);
  } catch {
    return {
      ok: true,
      warning:
        "El ticket se resolvió, pero no se pudo registrar la nota de validación — revisalo manualmente.",
    };
  }

  return { ok: true };
}
