import type { SupportTicketAttachment } from "@/features/support/domain/support-ticket-attachment.types";

export type CreateAttachmentData = {
  filename:   string;
  storageKey: string;
  mimeType:   string;
  sizeBytes:  number;
  uploadedBy: string | null;
};

export interface SupportTicketAttachmentRepository {
  create(ticketId: string, data: CreateAttachmentData): Promise<SupportTicketAttachment>;
  findByTicketId(ticketId: string): Promise<SupportTicketAttachment[]>;
  findById(id: string): Promise<SupportTicketAttachment | null>;
  delete(id: string): Promise<void>;
}
