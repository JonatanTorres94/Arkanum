import type { SupportTicketNoteRepository } from "@/features/support/infrastructure/support-ticket-note.repository";

export type CreateSupportTicketNoteResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

export async function createSupportTicketNoteUseCase(
  ticketId: string,
  content: string,
  createdBy: string | null,
  repository: SupportTicketNoteRepository
): Promise<CreateSupportTicketNoteResult> {
  try {
    const { id } = await repository.create(ticketId, content, createdBy);
    return { ok: true, id };
  } catch {
    return { ok: false, error: "No se pudo guardar la nota." };
  }
}
