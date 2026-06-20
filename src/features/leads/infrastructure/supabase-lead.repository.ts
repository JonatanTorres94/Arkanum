import { createServerClient } from "@/lib/supabase/server";
import type { LeadFormData } from "@/features/leads/domain/lead.schema";
import type {
  ConvertLeadToClientInput,
  Lead,
  LeadFollowUpInput,
  LeadIntentFieldsInput,
  LeadStatus,
  QualifiedStage,
} from "@/features/leads/domain/lead.types";
import type { LeadRepository } from "./lead.repository";

type LeadRow = {
  id: string;
  full_name: string;
  email: string;
  industry: string;
  process_to_improve: string;
  current_problem: string;
  urgency: string;
  budget: string;
  company: string | null;
  role: string | null;
  whatsapp: string | null;
  company_size: string | null;
  current_tools: string[];
  weekly_hours_lost: string | null;
  additional_message: string | null;
  status: string;
  qualified_stage: string | null;
  next_action: string | null;
  follow_up_date: string | null;
  source: string;
  created_at: string;
  updated_at: string;
  converted_to_client: boolean;
  converted_client_id: string | null;
  converted_project_id: string | null;
  converted_at: string | null;
  converted_by: string | null;
};

function toLeadDomain(row: LeadRow): Lead {
  return {
    id:               row.id,
    fullName:         row.full_name,
    email:            row.email,
    industry:         row.industry,
    processToImprove: row.process_to_improve,
    currentProblem:   row.current_problem,
    urgency:          row.urgency,
    budget:           row.budget,
    company:          row.company,
    role:             row.role,
    whatsapp:         row.whatsapp,
    companySize:      row.company_size,
    currentTools:     row.current_tools,
    weeklyHoursLost:  row.weekly_hours_lost,
    additionalMessage: row.additional_message,
    status:           row.status as LeadStatus,
    qualifiedStage:   row.qualified_stage as QualifiedStage | null,
    nextAction:       row.next_action,
    followUpDate:     row.follow_up_date,
    source:           row.source as "website",
    createdAt:        row.created_at,
    updatedAt:        row.updated_at,
    convertedToClient:  row.converted_to_client,
    convertedClientId:  row.converted_client_id,
    convertedProjectId: row.converted_project_id,
    convertedAt:        row.converted_at,
    convertedBy:        row.converted_by,
  };
}

export class SupabaseLeadRepository implements LeadRepository {
  async create(input: LeadFormData): Promise<{ id: string }> {
    const supabase = createServerClient();

    const { data, error } = await supabase
      .from("leads")
      .insert({
        full_name:          input.fullName,
        email:              input.email,
        industry:           input.industry,
        process_to_improve: input.processToImprove,
        current_problem:    input.currentProblem,
        urgency:            input.urgency,
        budget:             input.budget,
        company:            input.company           || null,
        role:               input.role              || null,
        whatsapp:           input.whatsapp          || null,
        company_size:       input.companySize       || null,
        current_tools:      input.currentTools      ?? [],
        weekly_hours_lost:  input.weeklyHoursLost   || null,
        additional_message: input.additionalMessage || null,
      })
      .select("id")
      .single<{ id: string }>();

    if (error || !data) throw new Error("Supabase insert failed");

    return { id: data.id };
  }

  async findAll(): Promise<Lead[]> {
    const supabase = createServerClient();

    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false })
      .returns<LeadRow[]>();

    if (error) throw new Error("Supabase findAll failed");

    return (data ?? []).map(toLeadDomain);
  }

  async findById(id: string): Promise<Lead | null> {
    const supabase = createServerClient();

    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .eq("id", id)
      .maybeSingle<LeadRow>();

    if (error) throw new Error("Supabase findById failed");
    if (!data) return null;

    return toLeadDomain(data);
  }

  async updateStatus(id: string, status: LeadStatus): Promise<void> {
    const supabase = createServerClient();

    const { error } = await supabase
      .from("leads")
      .update({ status })
      .eq("id", id);

    if (error) throw new Error("Supabase updateStatus failed");
  }

  async updateQualifiedStage(id: string, stage: QualifiedStage | null): Promise<void> {
    const supabase = createServerClient();

    const { error } = await supabase
      .from("leads")
      .update({ qualified_stage: stage })
      .eq("id", id);

    if (error) throw new Error("Supabase updateQualifiedStage failed");
  }

  async updateFollowUp(id: string, input: LeadFollowUpInput): Promise<void> {
    const supabase = createServerClient();

    const { error } = await supabase
      .from("leads")
      .update({ next_action: input.nextAction, follow_up_date: input.followUpDate })
      .eq("id", id);

    if (error) throw new Error("Supabase updateFollowUp failed");
  }

  async updateIntentFields(id: string, input: LeadIntentFieldsInput): Promise<void> {
    const supabase = createServerClient();

    const { error } = await supabase
      .from("leads")
      .update({
        industry:     input.industry,
        company_size: input.companySize,
        urgency:      input.urgency,
        budget:       input.budget,
      })
      .eq("id", id);

    if (error) throw new Error("Supabase updateIntentFields failed");
  }

  async convertToClient(id: string, input: ConvertLeadToClientInput): Promise<void> {
    const supabase = createServerClient();

    const { error } = await supabase
      .from("leads")
      .update({
        converted_to_client:  true,
        converted_client_id:  input.clientId,
        converted_project_id: input.projectId,
        converted_at:         new Date().toISOString(),
        converted_by:         input.convertedBy,
      })
      .eq("id", id);

    if (error) throw new Error("Supabase convertToClient failed");
  }
}
