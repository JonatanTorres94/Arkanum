import type { CreateSupportTicketInput, SupportTicket } from "@/features/support/domain/support-ticket.types";

export interface SupportTicketRepository {
  create(input: CreateSupportTicketInput): Promise<{ id: string }>;
  findAll(): Promise<SupportTicket[]>;
  findById(id: string): Promise<SupportTicket | null>;
}
