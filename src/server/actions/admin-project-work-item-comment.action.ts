"use server";

import { revalidatePath } from "next/cache";
import { getAdminUser } from "@/lib/auth/verify-admin";
import { getProjectWorkItemByIdUseCase } from "@/features/projects/application/get-project-work-item-by-id.use-case";
import { SupabaseProjectWorkItemRepository } from "@/features/projects/infrastructure/supabase-project-work-item.repository";
import { createProjectWorkItemCommentUseCase } from "@/features/projects/application/create-project-work-item-comment.use-case";
import { SupabaseProjectWorkItemCommentRepository } from "@/features/projects/infrastructure/supabase-project-work-item-comment.repository";
import { getSupportTicketByWorkItemUseCase } from "@/features/support/application/get-support-ticket-by-work-item.use-case";
import { SupabaseSupportTicketRepository } from "@/features/support/infrastructure/supabase-support-ticket.repository";
import { COMMENT_MAX_LENGTH } from "@/features/projects/domain/project-work-item-comment.types";

export async function createWorkItemCommentAction(
  projectId: string,
  workItemId: string,
  input: {
    content:          string;
    visibleToSupport: boolean;
  }
): Promise<{ error?: string }> {
  const user = await getAdminUser();
  if (!user) return { error: "No autorizado." };

  const content = input.content.trim();
  if (!content) return { error: "El comentario no puede estar vacío." };
  if (content.length > COMMENT_MAX_LENGTH) {
    return { error: `El comentario no puede superar los ${COMMENT_MAX_LENGTH} caracteres.` };
  }

  // Validate ownership: work item must belong to the given project.
  const workItemResult = await getProjectWorkItemByIdUseCase(
    workItemId,
    new SupabaseProjectWorkItemRepository()
  );
  if (!workItemResult.ok) return { error: "Work item no encontrado." };
  if (workItemResult.workItem.projectId !== projectId) {
    return { error: "El work item no pertenece al proyecto indicado." };
  }

  const result = await createProjectWorkItemCommentUseCase(
    workItemId,
    { content, visibleToSupport: input.visibleToSupport },
    user.email ?? null,
    new SupabaseProjectWorkItemCommentRepository()
  );

  if (!result.ok) return { error: result.error };

  // Always revalidate the work item detail.
  revalidatePath(`/admin/projects/${projectId}/work-items/${workItemId}`);

  // When the comment is visible to support, also revalidate the linked ticket page
  // so the support operator sees it immediately.
  if (input.visibleToSupport) {
    const ticketResult = await getSupportTicketByWorkItemUseCase(
      workItemId,
      new SupabaseSupportTicketRepository()
    );
    if (ticketResult.ok && ticketResult.ticket) {
      revalidatePath(`/admin/support/${ticketResult.ticket.id}`);
      revalidatePath("/admin/support");
    }
  }

  return {};
}
