import { createServerClient } from "@/lib/supabase/server";
import type { SupportTicketAttachment } from "@/features/support/domain/support-ticket-attachment.types";
import type {
  CreateAttachmentData,
  SupportTicketAttachmentRepository,
} from "./support-ticket-attachment.repository";

type AttachmentRow = {
  id:          string;
  ticket_id:   string;
  filename:    string;
  storage_key: string;
  mime_type:   string;
  size_bytes:  number;
  uploaded_by: string | null;
  created_at:  string;
};

function toDomain(row: AttachmentRow): SupportTicketAttachment {
  return {
    id:         row.id,
    ticketId:   row.ticket_id,
    filename:   row.filename,
    storageKey: row.storage_key,
    mimeType:   row.mime_type,
    sizeBytes:  row.size_bytes,
    uploadedBy: row.uploaded_by,
    createdAt:  row.created_at,
  };
}

export class SupabaseSupportTicketAttachmentRepository
  implements SupportTicketAttachmentRepository
{
  async create(ticketId: string, data: CreateAttachmentData): Promise<SupportTicketAttachment> {
    const supabase = createServerClient();

    const { data: row, error } = await supabase
      .from("support_ticket_attachments")
      .insert({
        ticket_id:   ticketId,
        filename:    data.filename,
        storage_key: data.storageKey,
        mime_type:   data.mimeType,
        size_bytes:  data.sizeBytes,
        uploaded_by: data.uploadedBy,
      })
      .select("*")
      .single<AttachmentRow>();

    if (error || !row) throw new Error("Supabase attachment insert failed");

    return toDomain(row);
  }

  async findByTicketId(ticketId: string): Promise<SupportTicketAttachment[]> {
    const supabase = createServerClient();

    const { data, error } = await supabase
      .from("support_ticket_attachments")
      .select("*")
      .eq("ticket_id", ticketId)
      .order("created_at", { ascending: true })
      .returns<AttachmentRow[]>();

    if (error) throw new Error("Supabase findByTicketId attachments failed");

    return (data ?? []).map(toDomain);
  }

  async findById(id: string): Promise<SupportTicketAttachment | null> {
    const supabase = createServerClient();

    const { data, error } = await supabase
      .from("support_ticket_attachments")
      .select("*")
      .eq("id", id)
      .maybeSingle<AttachmentRow>();

    if (error) throw new Error("Supabase attachment findById failed");
    if (!data) return null;

    return toDomain(data);
  }

  async delete(id: string): Promise<void> {
    const supabase = createServerClient();

    const { error } = await supabase
      .from("support_ticket_attachments")
      .delete()
      .eq("id", id);

    if (error) throw new Error("Supabase attachment delete failed");
  }
}
