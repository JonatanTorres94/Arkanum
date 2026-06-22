import type { SupportTicketNote } from "@/features/support/domain/support-ticket-note.types";

export interface SupportTicketNoteRepository {
  findByTicketId(ticketId: string): Promise<SupportTicketNote[]>;
  create(ticketId: string, content: string, createdBy: string | null): Promise<{ id: string }>;
}
