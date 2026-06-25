import { createServerClient } from "@/lib/supabase/server";
import type {
  CreateSupportTicketInput,
  EscalateSupportTicketInput,
  SupportTicket,
  TicketCategory,
  TicketPriority,
  TicketSource,
  TicketStatus,
  UpdateSupportTicketDetailsInput,
  UpdateSupportTicketStatusInput,
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
  escalated_work_item_id: string | null;
  escalated_at: string | null;
  escalated_by: string | null;
};

function toDomain(row: SupportTicketRow): SupportTicket {
  return {
    id:                  row.id,
    clientId:            row.client_id,
    projectId:           row.project_id,
    title:               row.title,
    description:         row.description,
    notes:               row.notes,
    reportedBy:          row.reported_by,
    source:              row.source as TicketSource,
    category:            row.category as TicketCategory,
    status:              row.status as TicketStatus,
    priority:            row.priority as TicketPriority,
    createdAt:           row.created_at,
    updatedAt:           row.updated_at,
    resolvedAt:          row.resolved_at,
    escalatedWorkItemId: row.escalated_work_item_id,
    escalatedAt:         row.escalated_at,
    escalatedBy:         row.escalated_by,
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

  async findByClientId(clientId: string): Promise<SupportTicket[]> {
    const supabase = createServerClient();

    const { data, error } = await supabase
      .from("support_tickets")
      .select("*")
      .eq("client_id", clientId)
      .order("updated_at", { ascending: false })
      .returns<SupportTicketRow[]>();

    if (error) throw new Error("Supabase findByClientId failed");

    return (data ?? []).map(toDomain);
  }

  async findByEscalatedWorkItemId(workItemId: string): Promise<SupportTicket | null> {
    const supabase = createServerClient();

    const { data, error } = await supabase
      .from("support_tickets")
      .select("*")
      .eq("escalated_work_item_id", workItemId)
      .maybeSingle<SupportTicketRow>();

    if (error) throw new Error("Supabase findByEscalatedWorkItemId failed");
    if (!data) return null;

    return toDomain(data);
  }

  async updateStatus(id: string, input: UpdateSupportTicketStatusInput): Promise<void> {
    const supabase = createServerClient();

    const { error } = await supabase
      .from("support_tickets")
      .update({ status: input.status, resolved_at: input.resolvedAt })
      .eq("id", id);

    if (error) throw new Error("Supabase updateStatus failed");
  }

  async updateDetails(id: string, input: UpdateSupportTicketDetailsInput): Promise<void> {
    const supabase = createServerClient();

    const { error } = await supabase
      .from("support_tickets")
      .update({
        title:       input.title,
        description: input.description,
        project_id:  input.projectId,
        reported_by: input.reportedBy,
        source:      input.source,
        category:    input.category,
        priority:    input.priority,
      })
      .eq("id", id);

    if (error) throw new Error("Supabase updateDetails failed");
  }

  async escalate(id: string, input: EscalateSupportTicketInput): Promise<void> {
    const supabase = createServerClient();

    const { error } = await supabase
      .from("support_tickets")
      .update({
        status:                 "escalated_to_development",
        escalated_work_item_id: input.escalatedWorkItemId,
        escalated_at:           input.escalatedAt,
        escalated_by:           input.escalatedBy,
      })
      .eq("id", id);

    if (error) throw new Error("Supabase escalate failed");
  }
}
