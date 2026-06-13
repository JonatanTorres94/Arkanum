import type { LeadFormData } from "@/features/leads/domain/lead.schema";

export interface LeadRepository {
  create(input: LeadFormData): Promise<{ id: string }>;
}
