export const ATTACHMENT_MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export const ALLOWED_ATTACHMENT_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "text/plain",
  "text/csv",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/zip",
] as const;

// Short-lived: enough for a browser to start a download.
export const SIGNED_URL_EXPIRY_SECONDS = 60;


export interface SupportTicketAttachment {
  id:         string;
  ticketId:   string;
  filename:   string;
  storageKey: string;
  mimeType:   string;
  sizeBytes:  number;
  uploadedBy: string | null;
  createdAt:  string;
}

export type UploadSupportTicketAttachmentInput = {
  filename:  string;
  mimeType:  string;
  sizeBytes: number;
  data:      ArrayBuffer;
};

export type UploadSupportTicketAttachmentResult =
  | { ok: true; attachment: SupportTicketAttachment }
  | { ok: false; error: string; partial?: true };

export type GetSupportTicketAttachmentsResult =
  | { ok: true; attachments: SupportTicketAttachment[] }
  | { ok: false; error: string };

export type GetSupportTicketAttachmentSignedUrlResult =
  | { ok: true; url: string; filename: string }
  | { ok: false; error: string };

export type DeleteSupportTicketAttachmentResult =
  | { ok: true }
  | { ok: false; error: string; partial?: true };
