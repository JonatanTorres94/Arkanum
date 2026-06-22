import type { SupportTicketNote } from "@/features/support/domain/support-ticket-note.types";
import type { SupportTicketNoteRepository } from "@/features/support/infrastructure/support-ticket-note.repository";

export type GetSupportTicketNotesResult =
  | { ok: true; notes: SupportTicketNote[] }
  | { ok: false; error: string };

export async function getSupportTicketNotesUseCase(
  ticketId: string,
  repository: SupportTicketNoteRepository
): Promise<GetSupportTicketNotesResult> {
  try {
    const notes = await repository.findByTicketId(ticketId);
    return { ok: true, notes };
  } catch {
    return { ok: false, error: "No se pudieron cargar las notas internas." };
  }
}
