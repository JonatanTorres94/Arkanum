import {
  SIGNED_URL_EXPIRY_SECONDS,
  type GetSupportTicketAttachmentSignedUrlResult,
} from "@/features/support/domain/support-ticket-attachment.types";
import type { SupportTicketAttachmentStorage } from "@/features/support/infrastructure/support-ticket-attachment-storage";
import type { SupportTicketAttachmentRepository } from "@/features/support/infrastructure/support-ticket-attachment.repository";

export async function getSupportTicketAttachmentSignedUrlUseCase(
  ticketId:     string,
  attachmentId: string,
  storage:      SupportTicketAttachmentStorage,
  repository:   SupportTicketAttachmentRepository
): Promise<GetSupportTicketAttachmentSignedUrlResult> {
  const attachment = await repository.findById(attachmentId);
  if (!attachment) return { ok: false, error: "El adjunto no fue encontrado." };

  if (attachment.ticketId !== ticketId) {
    return { ok: false, error: "El adjunto no pertenece al ticket indicado." };
  }

  try {
    const url = await storage.getSignedUrl(attachment.storageKey, SIGNED_URL_EXPIRY_SECONDS);
    return { ok: true, url, filename: attachment.filename };
  } catch {
    return { ok: false, error: "No se pudo generar el enlace de descarga." };
  }
}
