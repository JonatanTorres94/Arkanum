import type { LeadNote } from "@/features/leads/domain/note.types";

export interface NoteRepository {
  findByLeadId(leadId: string): Promise<LeadNote[]>;
  create(leadId: string, content: string, createdBy: string | null): Promise<{ id: string }>;
}
