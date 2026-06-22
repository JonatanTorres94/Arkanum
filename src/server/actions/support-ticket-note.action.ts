"use server";

import { revalidatePath } from "next/cache";
import { getAdminUser } from "@/lib/auth/verify-admin";
import { supportTicketNoteSchema } from "@/features/support/domain/support-ticket-note.schema";
import { createSupportTicketNoteUseCase } from "@/features/support/application/create-support-ticket-note.use-case";
import { SupabaseSupportTicketNoteRepository } from "@/features/support/infrastructure/supabase-support-ticket-note.repository";

export async function createSupportTicketNoteAction(
  ticketId: string,
  content: string
): Promise<{ error?: string }> {
  const user = await getAdminUser();
  if (!user) return { error: "No autorizado." };

  const result = supportTicketNoteSchema.safeParse({ content });
  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? "Nota inválida." };
  }

  const repository = new SupabaseSupportTicketNoteRepository();
  const outcome = await createSupportTicketNoteUseCase(
    ticketId,
    result.data.content,
    user.email ?? null,
    repository
  );

  if (!outcome.ok) return { error: outcome.error };

  revalidatePath(`/admin/support/${ticketId}`);
  return {};
}
