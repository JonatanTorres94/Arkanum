import type { SupportTicketRepository } from "@/features/support/infrastructure/support-ticket.repository";
import type { ProjectWorkItemRepository } from "@/features/projects/infrastructure/project-work-item.repository";
import type { SupportTicketNoteRepository } from "@/features/support/infrastructure/support-ticket-note.repository";

export type ResolveSupportInterventionResult =
  | { ok: true; warning?: string }
  | { ok: false; error: string; partial?: true };

export async function resolveSupportInterventionUseCase(
  ticketId: string,
  resolvedBy: string | null,
  ticketRepository: SupportTicketRepository,
  workItemRepository: ProjectWorkItemRepository,
  noteRepository: SupportTicketNoteRepository
): Promise<ResolveSupportInterventionResult> {
  const ticket = await ticketRepository.findById(ticketId);
  if (!ticket) return { ok: false, error: "Ticket no encontrado." };

  if (!ticket.escalatedWorkItemId) {
    return { ok: false, error: "Este ticket no tiene un work item de desarrollo vinculado." };
  }

  const workItem = await workItemRepository.findById(ticket.escalatedWorkItemId);
  if (!workItem) {
    return { ok: false, error: "El work item vinculado ya no está disponible." };
  }

  if (workItem.status !== "awaiting_support") {
    return {
      ok: false,
      error: "El work item no está esperando intervención de Soporte.",
    };
  }

  if (ticket.status !== "action_required") {
    return {
      ok: false,
      error: "El ticket no requiere actualmente una intervención de Soporte.",
    };
  }

  // Step 1 — Update ticket → escalated_to_development (authoritative).
  try {
    await ticketRepository.updateStatus(ticketId, {
      status:     "escalated_to_development",
      resolvedAt: null,
    });
  } catch {
    return { ok: false, error: "No se pudo actualizar el estado del ticket." };
  }

  // Step 2 — Update work item → ready.
  // WI and ticket must both be updated to leave a consistent state.
  // Failure here leaves ticket escalated but WI still awaiting_support — partial failure.
  try {
    await workItemRepository.updateStatus(ticket.escalatedWorkItemId, { status: "ready" });
  } catch {
    return {
      ok:    false,
      error: "La intervención se registró en el ticket, pero no se pudo devolver el work item a 'Listo para iniciar' — actualizalo manualmente.",
      partial: true,
    };
  }

  // Step 3 — Audit note (silent-fail).
  try {
    await noteRepository.create(
      ticketId,
      "Soporte atendió la solicitud de intervención de Desarrollo y devolvió el trabajo al equipo.",
      resolvedBy
    );
  } catch {
    // Intentional: note failure is non-blocking.
  }

  return { ok: true };
}
