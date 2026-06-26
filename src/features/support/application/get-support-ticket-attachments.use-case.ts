import type { GetSupportTicketAttachmentsResult } from "@/features/support/domain/support-ticket-attachment.types";
import type { SupportTicketAttachmentRepository } from "@/features/support/infrastructure/support-ticket-attachment.repository";

export async function getSupportTicketAttachmentsUseCase(
  ticketId:   string,
  repository: SupportTicketAttachmentRepository
): Promise<GetSupportTicketAttachmentsResult> {
  try {
    const attachments = await repository.findByTicketId(ticketId);
    return { ok: true, attachments };
  } catch {
    return { ok: false, error: "No se pudieron cargar los adjuntos." };
  }
}
