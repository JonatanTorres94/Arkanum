import type { NoteRepository } from "@/features/leads/infrastructure/note.repository";

export type CreateLeadNoteResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

export async function createLeadNoteUseCase(
  leadId: string,
  content: string,
  createdBy: string | null,
  repository: NoteRepository
): Promise<CreateLeadNoteResult> {
  try {
    const { id } = await repository.create(leadId, content, createdBy);
    return { ok: true, id };
  } catch {
    return { ok: false, error: "No se pudo guardar la nota." };
  }
}
