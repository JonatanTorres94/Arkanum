import { createServerClient } from "@/lib/supabase/server";
import type {
  CreateSupportTicketInput,
  SupportTicket,
  TicketCategory,
  TicketPriority,
  TicketSource,
  TicketStatus,
} from "@/features/support/domain/support-ticket.types";
import type { SupportTicketRepository } from "./support-ticket.repository";

type SupportTicketRow = {
  id: string;
  client_id: string;
  project_id: string | null;
  title: string;
  description: string | null;
  notes: string | null;
  reported_by: string | null;
  source: string;
  category: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
};

function toDomain(row: SupportTicketRow): SupportTicket {
  return {
    id:          row.id,
    clientId:    row.client_id,
    projectId:   row.project_id,
    title:       row.title,
    description: row.description,
    notes:       row.notes,
    reportedBy:  row.reported_by,
    source:      row.source as TicketSource,
    category:    row.category as TicketCategory,
    status:      row.status as TicketStatus,
    priority:    row.priority as TicketPriority,
    createdAt:   row.created_at,
    updatedAt:   row.updated_at,
    resolvedAt:  row.resolved_at,
  };
}

export class SupabaseSupportTicketRepository implements SupportTicketRepository {
  async create(input: CreateSupportTicketInput): Promise<{ id: string }> {
    const supabase = createServerClient();

    const { data, error } = await supabase
      .from("support_tickets")
      .insert({
        client_id:   input.clientId,
        project_id:  input.projectId,
        title:       input.title,
        description: input.description,
        notes:       input.notes,
        reported_by: input.reportedBy,
        source:      input.source,
        category:    input.category,
        status:      input.status,
        priority:    input.priority,
      })
      .select("id")
      .single<{ id: string }>();

    if (error || !data) throw new Error("Supabase insert failed");

    return { id: data.id };
  }

  async findAll(): Promise<SupportTicket[]> {
    const supabase = createServerClient();

    const { data, error } = await supabase
      .from("support_tickets")
      .select("*")
      .order("created_at", { ascending: false })
      .returns<SupportTicketRow[]>();

    if (error) throw new Error("Supabase findAll failed");

    return (data ?? []).map(toDomain);
  }

  async findById(id: string): Promise<SupportTicket | null> {
    const supabase = createServerClient();

    const { data, error } = await supabase
      .from("support_tickets")
      .select("*")
      .eq("id", id)
      .maybeSingle<SupportTicketRow>();

    if (error) throw new Error("Supabase findById failed");
    if (!data) return null;

    return toDomain(data);
  }
}
