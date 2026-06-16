import type { LeadFormData } from "@/features/leads/domain/lead.schema";
import type { Lead, LeadStatus } from "@/features/leads/domain/lead.types";

export interface LeadRepository {
  create(input: LeadFormData): Promise<{ id: string }>;
  findAll(): Promise<Lead[]>;
  findById(id: string): Promise<Lead | null>;
  updateStatus(id: string, status: LeadStatus): Promise<void>;
}
