import { createServerClient } from "@/lib/supabase/server";
import type { SupportTicketNote } from "@/features/support/domain/support-ticket-note.types";
import type { SupportTicketNoteRepository } from "./support-ticket-note.repository";

type SupportTicketNoteRow = {
  id: string;
  ticket_id: string;
  content: string;
  created_by: string | null;
  created_at: string;
};

function toDomain(row: SupportTicketNoteRow): SupportTicketNote {
  return {
    id:        row.id,
    ticketId:  row.ticket_id,
    content:   row.content,
    createdBy: row.created_by,
    createdAt: row.created_at,
  };
}

export class SupabaseSupportTicketNoteRepository implements SupportTicketNoteRepository {
  async findByTicketId(ticketId: string): Promise<SupportTicketNote[]> {
    const supabase = createServerClient();

    const { data, error } = await supabase
      .from("support_ticket_notes")
      .select("*")
      .eq("ticket_id", ticketId)
      .order("created_at", { ascending: false })
      .returns<SupportTicketNoteRow[]>();

    if (error) throw new Error("Supabase findByTicketId failed");

    return (data ?? []).map(toDomain);
  }

  async create(
    ticketId: string,
    content: string,
    createdBy: string | null
  ): Promise<{ id: string }> {
    const supabase = createServerClient();

    const { data, error } = await supabase
      .from("support_ticket_notes")
      .insert({ ticket_id: ticketId, content, created_by: createdBy })
      .select("id")
      .single<{ id: string }>();

    if (error || !data) throw new Error("Supabase note insert failed");

    return { id: data.id };
  }
}
