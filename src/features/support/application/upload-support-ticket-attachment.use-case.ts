import {
  ALLOWED_ATTACHMENT_MIME_TYPES,
  ATTACHMENT_MAX_SIZE_BYTES,
  type UploadSupportTicketAttachmentInput,
  type UploadSupportTicketAttachmentResult,
} from "@/features/support/domain/support-ticket-attachment.types";
import { validateAttachmentContent } from "@/features/support/domain/support-ticket-attachment-validation";
import type { SupportTicketAttachmentStorage } from "@/features/support/infrastructure/support-ticket-attachment-storage";
import type { SupportTicketAttachmentRepository } from "@/features/support/infrastructure/support-ticket-attachment.repository";

export async function uploadSupportTicketAttachmentUseCase(
  ticketId:   string,
  input:      UploadSupportTicketAttachmentInput,
  uploadedBy: string | null,
  storage:    SupportTicketAttachmentStorage,
  repository: SupportTicketAttachmentRepository
): Promise<UploadSupportTicketAttachmentResult> {
  const filename = input.filename.trim();
  if (!filename) {
    return { ok: false, error: "El nombre del archivo es inválido." };
  }

  if (input.sizeBytes > ATTACHMENT_MAX_SIZE_BYTES) {
    return { ok: false, error: "El archivo excede el límite de 10 MB." };
  }

  if (!(ALLOWED_ATTACHMENT_MIME_TYPES as ReadonlyArray<string>).includes(input.mimeType)) {
    return { ok: false, error: "Tipo de archivo no permitido." };
  }

  // Validate magic bytes to reject spoofed MIME types (e.g. EXE declared as image/png).
  const contentCheck = validateAttachmentContent(input.data, input.mimeType);
  if (!contentCheck.valid) {
    return { ok: false, error: contentCheck.reason };
  }

  // Deterministic key scoped to ticket; ID generated here so it is available for compensation.
  const attachmentId = crypto.randomUUID();
  const storageKey   = `tickets/${ticketId}/${attachmentId}`;

  // Step 1 — Upload to storage (authoritative).
  try {
    await storage.upload(storageKey, input.data, input.mimeType);
  } catch {
    return { ok: false, error: "No se pudo subir el archivo al almacenamiento." };
  }

  // Step 2 — Create metadata row (authoritative).
  // On failure, compensate by deleting the orphaned file from storage.
  try {
    const attachment = await repository.create(ticketId, {
      filename:   filename,
      storageKey: storageKey,
      mimeType:   input.mimeType,
      sizeBytes:  input.sizeBytes,
      uploadedBy: uploadedBy,
    });
    return { ok: true, attachment };
  } catch {
    try {
      await storage.delete(storageKey);
    } catch {
      // Compensation failed: orphaned file in bucket. Return partial to signal manual cleanup.
      return {
        ok:      false,
        error:   "El archivo se subió pero no pudo registrarse, y la compensación automática falló. El archivo queda sin referencia en el bucket — notificá al administrador.",
        partial: true,
      };
    }
    return { ok: false, error: "No se pudo registrar el archivo. El upload fue revertido." };
  }
}
