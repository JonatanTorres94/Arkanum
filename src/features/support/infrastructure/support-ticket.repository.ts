import type {
  CreateSupportTicketInput,
  EscalateSupportTicketInput,
  SupportTicket,
  UpdateSupportTicketStatusInput,
} from "@/features/support/domain/support-ticket.types";

export interface SupportTicketRepository {
  create(input: CreateSupportTicketInput): Promise<{ id: string }>;
  findAll(): Promise<SupportTicket[]>;
  findById(id: string): Promise<SupportTicket | null>;
  updateStatus(id: string, input: UpdateSupportTicketStatusInput): Promise<void>;
  escalate(id: string, input: EscalateSupportTicketInput): Promise<void>;
}
