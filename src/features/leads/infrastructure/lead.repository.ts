import type { LeadFormData } from "@/features/leads/domain/lead.schema";
import type {
  Lead,
  LeadFollowUpInput,
  LeadIntentFieldsInput,
  LeadStatus,
  QualifiedStage,
} from "@/features/leads/domain/lead.types";

export interface LeadRepository {
  create(input: LeadFormData): Promise<{ id: string }>;
  findAll(): Promise<Lead[]>;
  findById(id: string): Promise<Lead | null>;
  updateStatus(id: string, status: LeadStatus): Promise<void>;
  updateQualifiedStage(id: string, stage: QualifiedStage | null): Promise<void>;
  updateFollowUp(id: string, input: LeadFollowUpInput): Promise<void>;
  updateIntentFields(id: string, input: LeadIntentFieldsInput): Promise<void>;
}
