import type { DeleteSupportTicketAttachmentResult } from "@/features/support/domain/support-ticket-attachment.types";
import type { SupportTicketAttachmentStorage } from "@/features/support/infrastructure/support-ticket-attachment-storage";
import type { SupportTicketAttachmentRepository } from "@/features/support/infrastructure/support-ticket-attachment.repository";

export async function deleteSupportTicketAttachmentUseCase(
  ticketId:     string,
  attachmentId: string,
  storage:      SupportTicketAttachmentStorage,
  repository:   SupportTicketAttachmentRepository
): Promise<DeleteSupportTicketAttachmentResult> {
  const attachment = await repository.findById(attachmentId);
  if (!attachment) return { ok: false, error: "El adjunto no fue encontrado." };

  if (attachment.ticketId !== ticketId) {
    return { ok: false, error: "El adjunto no pertenece al ticket indicado." };
  }

  // Step 1 — Delete metadata row first (authoritative).
  // Deliberate order: removing metadata immediately makes the file inaccessible from the app,
  // even if the storage delete that follows fails. The trade-off is a potentially orphaned bucket
  // object, surfaced as partial:true and reported as a warning. Alternative (storage first) would
  // leave a dangling download link visible to users if the metadata delete then fails.
  try {
    await repository.delete(attachmentId);
  } catch {
    return { ok: false, error: "No se pudo eliminar el registro del adjunto." };
  }

  // Step 2 — Delete file from storage (partial failure: metadata gone, file orphaned in bucket).
  try {
    await storage.delete(attachment.storageKey);
  } catch {
    return {
      ok:      false,
      error:   "El adjunto fue eliminado del registro, pero el archivo permanece en almacenamiento — notificá al administrador.",
      partial: true,
    };
  }

  return { ok: true };
}
