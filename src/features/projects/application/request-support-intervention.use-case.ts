import type { ProjectWorkItemCommentRepository } from "@/features/projects/infrastructure/project-work-item-comment.repository";
import type { ProjectWorkItemRepository } from "@/features/projects/infrastructure/project-work-item.repository";
import type { SupportTicketRepository } from "@/features/support/infrastructure/support-ticket.repository";
import type { SupportTicketNoteRepository } from "@/features/support/infrastructure/support-ticket-note.repository";
import { COMMENT_MAX_LENGTH } from "@/features/projects/domain/project-work-item-comment.types";

// Statuses from which development can legitimately request support intervention.
// Done and cancelled are terminal — no intervention makes sense from those states.
// Already awaiting support — idempotent guard.
const INELIGIBLE_FOR_INTERVENTION = new Set(["awaiting_support", "done", "cancelled"]);

export type RequestSupportInterventionResult =
  | { ok: true; warning?: string }
  | { ok: false; error: string; partial?: true };

export async function requestSupportInterventionUseCase(
  workItemId: string,
  ticketId: string,
  comment: string,
  requestedBy: string | null,
  commentRepository: ProjectWorkItemCommentRepository,
  workItemRepository: ProjectWorkItemRepository,
  ticketRepository: SupportTicketRepository,
  noteRepository: SupportTicketNoteRepository
): Promise<RequestSupportInterventionResult> {
  const content = comment.trim();
  if (!content) {
    return { ok: false, error: "El comentario de intervención es obligatorio." };
  }
  if (content.length > COMMENT_MAX_LENGTH) {
    return { ok: false, error: `El comentario no puede superar los ${COMMENT_MAX_LENGTH} caracteres.` };
  }

  const workItem = await workItemRepository.findById(workItemId);
  if (!workItem) return { ok: false, error: "Work item no encontrado." };

  if (INELIGIBLE_FOR_INTERVENTION.has(workItem.status)) {
    if (workItem.status === "awaiting_support") {
      return { ok: false, error: "Ya hay una solicitud de intervención activa para este work item." };
    }
    return { ok: false, error: "No se puede solicitar intervención desde el estado actual del work item." };
  }

  // Step 1 — Create comment visible to support (authoritative).
  try {
    await commentRepository.create(workItemId, { content, visibleToSupport: true }, requestedBy);
  } catch {
    return { ok: false, error: "No se pudo registrar el comentario de intervención." };
  }

  // Step 2 — Update work item status to awaiting_support (authoritative).
  try {
    await workItemRepository.updateStatus(workItemId, { status: "awaiting_support" });
  } catch {
    return { ok: false, error: "No se pudo actualizar el estado del work item." };
  }

  // Step 3 — Update ticket to action_required.
  // This is the primary signal for Support — failing here is a partial failure, not a warning.
  try {
    await ticketRepository.updateStatus(ticketId, {
      status:     "action_required",
      resolvedAt: null,
    });
  } catch {
    return {
      ok:    false,
      error: "La solicitud quedó parcialmente aplicada: el comentario y el work item se actualizaron, pero el ticket no pudo marcarse como Requiere atención.",
      partial: true,
    };
  }

  // Step 4 — Audit note (silent-fail).
  try {
    await noteRepository.create(
      ticketId,
      "Desarrollo solicitó intervención de Soporte. Revisá los comentarios del work item vinculado.",
      requestedBy
    );
  } catch {
    // Intentional: note failure is non-blocking.
  }

  return { ok: true };
}
