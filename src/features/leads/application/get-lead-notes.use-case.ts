import type { LeadNote } from "@/features/leads/domain/note.types";
import type { NoteRepository } from "@/features/leads/infrastructure/note.repository";

export type GetLeadNotesResult =
  | { ok: true; notes: LeadNote[] }
  | { ok: false; error: string };

export async function getLeadNotesUseCase(
  leadId: string,
  repository: NoteRepository
): Promise<GetLeadNotesResult> {
  try {
    const notes = await repository.findByLeadId(leadId);
    return { ok: true, notes };
  } catch {
    return { ok: false, error: "No se pudieron cargar las notas." };
  }
}
