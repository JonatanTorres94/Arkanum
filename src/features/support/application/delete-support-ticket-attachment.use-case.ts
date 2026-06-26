import type { DeleteSupportTicketAttachmentResult } from "@/features/support/domain/support-ticket-attachment.types";
import type { SupportTicketAttachmentStorage } from "@/features/support/infrastructure/support-ticket-attachment-storage";
import type { SupportTicketAttachmentRepository } from "@/features/support/infrastructure/support-ticket-attachment.repository";

export async function deleteSupportTicketAttachmentUseCase(
  attachmentId: string,
  storage:      SupportTicketAttachmentStorage,
  repository:   SupportTicketAttachmentRepository
): Promise<DeleteSupportTicketAttachmentResult> {
  const attachment = await repository.findById(attachmentId);
  if (!attachment) return { ok: false, error: "El adjunto no fue encontrado." };

  // Step 1 — Delete metadata row first (authoritative).
  // If this fails, nothing changes — the file is still accessible.
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
