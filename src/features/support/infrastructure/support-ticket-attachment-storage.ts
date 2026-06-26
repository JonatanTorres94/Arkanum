export interface SupportTicketAttachmentStorage {
  upload(key: string, data: ArrayBuffer, mimeType: string): Promise<void>;
  getSignedUrl(key: string, expiresInSeconds: number): Promise<string>;
  delete(key: string): Promise<void>;
}
