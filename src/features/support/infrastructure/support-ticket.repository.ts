import type {
  CreateSupportTicketInput,
  EscalateSupportTicketInput,
  SupportTicket,
  UpdateSupportTicketDetailsInput,
  UpdateSupportTicketStatusInput,
} from "@/features/support/domain/support-ticket.types";

export interface SupportTicketRepository {
  create(input: CreateSupportTicketInput): Promise<{ id: string }>;
  findAll(): Promise<SupportTicket[]>;
  findById(id: string): Promise<SupportTicket | null>;
  findByClientId(clientId: string): Promise<SupportTicket[]>;
  findByEscalatedWorkItemId(workItemId: string): Promise<SupportTicket | null>;
  updateStatus(id: string, input: UpdateSupportTicketStatusInput): Promise<void>;
  updateDetails(id: string, input: UpdateSupportTicketDetailsInput): Promise<void>;
  escalate(id: string, input: EscalateSupportTicketInput): Promise<void>;
}
