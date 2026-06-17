import { createServerClient } from "@/lib/supabase/server";
import type { CreateLeadEventInput, LeadEvent, LeadEventType } from "@/features/leads/domain/lead-event.types";
import type { EventRepository } from "./event.repository";

type EventRow = {
  id:          string;
  lead_id:     string;
  type:        string;
  from_status: string | null;
  to_status:   string | null;
  created_by:  string | null;
  created_at:  string;
};

function toEventDomain(row: EventRow): LeadEvent {
  return {
    id:         row.id,
    leadId:     row.lead_id,
    type:       row.type as LeadEventType,
    fromStatus: row.from_status,
    toStatus:   row.to_status,
    createdBy:  row.created_by,
    createdAt:  row.created_at,
  };
}

export class SupabaseEventRepository implements EventRepository {
  async create(input: CreateLeadEventInput): Promise<void> {
    const supabase = createServerClient();

    const { error } = await supabase.from("lead_events").insert({
      lead_id:     input.leadId,
      type:        input.type,
      from_status: input.fromStatus ?? null,
      to_status:   input.toStatus   ?? null,
      created_by:  input.createdBy  ?? null,
    });

    if (error) throw new Error("Supabase event create failed");
  }

  async findByLeadId(leadId: string): Promise<LeadEvent[]> {
    const supabase = createServerClient();

    const { data, error } = await supabase
      .from("lead_events")
      .select("*")
      .eq("lead_id", leadId)
      .order("created_at", { ascending: false })
      .returns<EventRow[]>();

    if (error) throw new Error("Supabase event findByLeadId failed");

    return (data ?? []).map(toEventDomain);
  }
}
