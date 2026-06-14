import { createServerClient } from "@/lib/supabase/server";
import type { LeadNote } from "@/features/leads/domain/note.types";
import type { NoteRepository } from "./note.repository";

type NoteRow = {
  id: string;
  lead_id: string;
  content: string;
  created_by: string | null;
  created_at: string;
};

function toNoteDomain(row: NoteRow): LeadNote {
  return {
    id:        row.id,
    leadId:    row.lead_id,
    content:   row.content,
    createdBy: row.created_by,
    createdAt: row.created_at,
  };
}

export class SupabaseNoteRepository implements NoteRepository {
  async findByLeadId(leadId: string): Promise<LeadNote[]> {
    const supabase = createServerClient();

    const { data, error } = await supabase
      .from("lead_notes")
      .select("*")
      .eq("lead_id", leadId)
      .order("created_at", { ascending: false })
      .returns<NoteRow[]>();

    if (error) throw new Error("Supabase findByLeadId failed");

    return (data ?? []).map(toNoteDomain);
  }

  async create(
    leadId: string,
    content: string,
    createdBy: string | null
  ): Promise<{ id: string }> {
    const supabase = createServerClient();

    const { data, error } = await supabase
      .from("lead_notes")
      .insert({ lead_id: leadId, content, created_by: createdBy })
      .select("id")
      .single<{ id: string }>();

    if (error || !data) throw new Error("Supabase note insert failed");

    return { id: data.id };
  }
}
