import { createServerClient } from "@/lib/supabase/server";
import type { LeadFormData } from "@/features/leads/domain/lead.schema";
import type { LeadRepository } from "./lead.repository";

type LeadInsertRow = {
  id: string;
};

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
        company:            input.company       || null,
        role:               input.role          || null,
        whatsapp:           input.whatsapp      || null,
        company_size:       input.companySize   || null,
        current_tools:      input.currentTools  ?? [],
        weekly_hours_lost:  input.weeklyHoursLost || null,
        additional_message: input.additionalMessage || null,
      })
      .select("id")
      .single<LeadInsertRow>();

    if (error || !data) {
      throw new Error("Supabase insert failed");
    }

    return { id: data.id };
  }
}
