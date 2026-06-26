"use server";

import { revalidatePath } from "next/cache";
import { getAdminUser } from "@/lib/auth/verify-admin";
import { getProjectWorkItemByIdUseCase } from "@/features/projects/application/get-project-work-item-by-id.use-case";
import { SupabaseProjectWorkItemRepository } from "@/features/projects/infrastructure/supabase-project-work-item.repository";
import { createProjectWorkItemCommentUseCase } from "@/features/projects/application/create-project-work-item-comment.use-case";
import { SupabaseProjectWorkItemCommentRepository } from "@/features/projects/infrastructure/supabase-project-work-item-comment.repository";
import { getSupportTicketByWorkItemUseCase } from "@/features/support/application/get-support-ticket-by-work-item.use-case";
import { SupabaseSupportTicketRepository } from "@/features/support/infrastructure/supabase-support-ticket.repository";

export async function createWorkItemCommentAction(
  projectId: string,
  workItemId: string,
  input: {
    content:          string;
    visibleToSupport: boolean;
  }
): Promise<{ error?: string; warning?: string }> {
  const user = await getAdminUser();
  if (!user) return { error: "No autorizado." };

  // Validate ownership: work item must belong to the given project.
  const workItemResult = await getProjectWorkItemByIdUseCase(
    workItemId,
    new SupabaseProjectWorkItemRepository()
  );
  if (!workItemResult.ok) return { error: "Work item no encontrado." };
  if (workItemResult.workItem.projectId !== projectId) {
    return { error: "El work item no pertenece al proyecto indicado." };
  }

  // Use case handles all content validation (empty, whitespace, length, trim).
  const result = await createProjectWorkItemCommentUseCase(
    workItemId,
    { content: input.content, visibleToSupport: input.visibleToSupport },
    user.email ?? null,
    new SupabaseProjectWorkItemCommentRepository()
  );

  if (!result.ok) return { error: result.error };

  // Always revalidate work item detail + parent project.
  revalidatePath(`/admin/projects/${projectId}/work-items/${workItemId}`);
  revalidatePath(`/admin/projects/${projectId}`);

  if (!input.visibleToSupport) return {};

  // When visible to support: look up the linked ticket and revalidate accordingly.
  const ticketResult = await getSupportTicketByWorkItemUseCase(
    workItemId,
    new SupabaseSupportTicketRepository()
  );

  // Ticket lookup failed unexpectedly — comment persisted but support routes may be stale.
  if (!ticketResult.ok) {
    return {
      warning:
        "El comentario se guardó, pero no se pudo determinar el ticket vinculado — las páginas de soporte pueden no reflejar el cambio de inmediato.",
    };
  }

  // Work item is not linked to any support ticket — no support routes to revalidate.
  if (!ticketResult.ticket) return {};

  const { ticket } = ticketResult;
  revalidatePath(`/admin/support/${ticket.id}`);
  revalidatePath("/admin/support");
  if (ticket.clientId) revalidatePath(`/admin/clients/${ticket.clientId}`);

  return {};
}
