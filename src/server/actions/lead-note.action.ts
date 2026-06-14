"use server";

import { revalidatePath } from "next/cache";
import { getAdminUser } from "@/lib/auth/verify-admin";
import { noteSchema } from "@/features/leads/domain/note.schema";
import { createLeadNoteUseCase } from "@/features/leads/application/create-lead-note.use-case";
import { SupabaseNoteRepository } from "@/features/leads/infrastructure/supabase-note.repository";

export async function createLeadNoteAction(
  leadId: string,
  content: string
): Promise<{ error?: string }> {
  const user = await getAdminUser();
  if (!user) return { error: "No autorizado." };

  const result = noteSchema.safeParse({ content });
  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? "Nota inválida." };
  }

  const repository = new SupabaseNoteRepository();
  const outcome = await createLeadNoteUseCase(
    leadId,
    result.data.content,
    user.email ?? null,
    repository
  );

  if (!outcome.ok) return { error: outcome.error };

  revalidatePath(`/admin/leads/${leadId}`);
  return {};
}
