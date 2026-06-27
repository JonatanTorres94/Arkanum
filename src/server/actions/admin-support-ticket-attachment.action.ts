"use server";

import { revalidatePath } from "next/cache";
import { getAdminUser } from "@/lib/auth/verify-admin";
import { getSupportTicketByIdUseCase } from "@/features/support/application/get-support-ticket-by-id.use-case";
import { uploadSupportTicketAttachmentUseCase } from "@/features/support/application/upload-support-ticket-attachment.use-case";
import { deleteSupportTicketAttachmentUseCase } from "@/features/support/application/delete-support-ticket-attachment.use-case";
import { getSupportTicketAttachmentSignedUrlUseCase } from "@/features/support/application/get-support-ticket-attachment-signed-url.use-case";
import { SupabaseSupportTicketRepository } from "@/features/support/infrastructure/supabase-support-ticket.repository";
import { SupabaseSupportTicketAttachmentRepository } from "@/features/support/infrastructure/supabase-support-ticket-attachment.repository";
import { SupabaseSupportTicketAttachmentStorage } from "@/features/support/infrastructure/supabase-support-ticket-attachment-storage";
import { ATTACHMENT_MAX_SIZE_BYTES } from "@/features/support/domain/support-ticket-attachment.types";
import { TERMINAL_TICKET_STATUSES } from "@/features/support/domain/support-ticket.types";

// ─── Upload ───────────────────────────────────────────────────────────────────

export async function uploadSupportTicketAttachmentAction(
  ticketId: string,
  formData: FormData
): Promise<{ error?: string; warning?: string }> {
  const user = await getAdminUser();
  if (!user) return { error: "No autorizado." };

  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) return { error: "No se recibió ningún archivo." };

  // Boundary-level size guard to give a fast, clear response before reading bytes.
  if (file.size > ATTACHMENT_MAX_SIZE_BYTES) {
    return { error: "El archivo excede el límite de 10 MB." };
  }

  const ticketResult = await getSupportTicketByIdUseCase(
    ticketId,
    new SupabaseSupportTicketRepository()
  );
  if (!ticketResult.ok) return { error: "Ticket no encontrado." };

  if (TERMINAL_TICKET_STATUSES.has(ticketResult.ticket.status)) {
    return { error: "Este ticket está cerrado. Los adjuntos son de solo lectura." };
  }

  const data = await file.arrayBuffer();

  const outcome = await uploadSupportTicketAttachmentUseCase(
    ticketId,
    { filename: file.name, mimeType: file.type, sizeBytes: file.size, data },
    user.email ?? null,
    new SupabaseSupportTicketAttachmentStorage(),
    new SupabaseSupportTicketAttachmentRepository()
  );

  revalidatePath(`/admin/support/${ticketId}`);

  // partial:true means: orphaned storage object + no metadata → upload failed, not a warning.
  if (!outcome.ok) return { error: outcome.error };
  return {};
}

// ─── Get signed download URL ──────────────────────────────────────────────────

export async function getSupportTicketAttachmentUrlAction(
  ticketId:     string,
  attachmentId: string
): Promise<{ url?: string; filename?: string; error?: string }> {
  const user = await getAdminUser();
  if (!user) return { error: "No autorizado." };

  const ticketResult = await getSupportTicketByIdUseCase(
    ticketId,
    new SupabaseSupportTicketRepository()
  );
  if (!ticketResult.ok) return { error: "Ticket no encontrado." };

  const outcome = await getSupportTicketAttachmentSignedUrlUseCase(
    ticketId,
    attachmentId,
    new SupabaseSupportTicketAttachmentStorage(),
    new SupabaseSupportTicketAttachmentRepository()
  );

  if (!outcome.ok) return { error: outcome.error };
  return { url: outcome.url, filename: outcome.filename };
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deleteSupportTicketAttachmentAction(
  ticketId:     string,
  attachmentId: string
): Promise<{ error?: string; warning?: string }> {
  const user = await getAdminUser();
  if (!user) return { error: "No autorizado." };

  const ticketResult = await getSupportTicketByIdUseCase(
    ticketId,
    new SupabaseSupportTicketRepository()
  );
  if (!ticketResult.ok) return { error: "Ticket no encontrado." };

  if (TERMINAL_TICKET_STATUSES.has(ticketResult.ticket.status)) {
    return { error: "Este ticket está cerrado. Los adjuntos son de solo lectura." };
  }

  const outcome = await deleteSupportTicketAttachmentUseCase(
    ticketId,
    attachmentId,
    new SupabaseSupportTicketAttachmentStorage(),
    new SupabaseSupportTicketAttachmentRepository()
  );

  revalidatePath(`/admin/support/${ticketId}`);

  if (!outcome.ok) {
    return outcome.partial
      ? { warning: outcome.error }
      : { error: outcome.error };
  }
  return {};
}
