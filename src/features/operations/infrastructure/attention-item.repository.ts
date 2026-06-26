import type { SupportTicket } from "@/features/support/domain/support-ticket.types";
import type { ProjectWorkItem } from "@/features/projects/domain/project-work-item.types";

// Ticket-centric candidate: always has a ticket; WI is optional or missing.
export interface TicketCandidate {
  type:            "ticket";
  ticket:          SupportTicket;
  workItem:        ProjectWorkItem | null;
  // true when ticket.escalatedWorkItemId is set but no matching WI record exists in the DB.
  workItemMissing: boolean;
}

// Standalone WI candidate: an active work item not linked to any non-terminal ticket.
export interface StandaloneWorkItemCandidate {
  type:     "standalone_work_item";
  workItem: ProjectWorkItem;
}

export type AttentionCandidate = TicketCandidate | StandaloneWorkItemCandidate;

export interface AttentionItemRepository {
  // Returns all candidates that may need operational attention:
  // - all non-terminal Support tickets (with optional linked WI)
  // - all active Work Items not linked to any of the above tickets
  findAttentionCandidates(): Promise<AttentionCandidate[]>;
}
