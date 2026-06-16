import type { CreateLeadEventInput, LeadEvent } from "@/features/leads/domain/lead-event.types";

export interface EventRepository {
  create(input: CreateLeadEventInput): Promise<void>;
  findByLeadId(leadId: string): Promise<LeadEvent[]>;
}
