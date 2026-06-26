import { createServerClient } from "@/lib/supabase/server";
import type { SupportTicketAttachmentStorage } from "./support-ticket-attachment-storage";

const BUCKET = "support-ticket-attachments";

export class SupabaseSupportTicketAttachmentStorage
  implements SupportTicketAttachmentStorage
{
  async upload(key: string, data: ArrayBuffer, mimeType: string): Promise<void> {
    const supabase = createServerClient();

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(key, data, { contentType: mimeType, upsert: false });

    if (error) throw new Error(`Storage upload failed: ${error.message}`);
  }

  async getSignedUrl(key: string, expiresInSeconds: number): Promise<string> {
    const supabase = createServerClient();

    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(key, expiresInSeconds);

    if (error || !data?.signedUrl) throw new Error("Failed to generate signed URL");

    return data.signedUrl;
  }

  async delete(key: string): Promise<void> {
    const supabase = createServerClient();

    const { error } = await supabase.storage.from(BUCKET).remove([key]);

    if (error) throw new Error(`Storage delete failed: ${error.message}`);
  }
}
