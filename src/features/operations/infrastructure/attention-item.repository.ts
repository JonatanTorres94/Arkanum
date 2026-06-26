import type { SupportTicket } from "@/features/support/domain/support-ticket.types";
import type { ProjectWorkItem } from "@/features/projects/domain/project-work-item.types";

// Raw data pair used by the use case to derive attention items.
export interface AttentionCandidate {
  ticket:          SupportTicket;
  workItem:        ProjectWorkItem | null;
  // true when ticket.escalatedWorkItemId is set but the WI doesn't exist in the DB.
  workItemMissing: boolean;
}

export interface AttentionItemRepository {
  // Returns all ticket+workItem pairs that may need operational attention.
  // Excludes terminal tickets (resolved / closed / cancelled).
  findAttentionCandidates(): Promise<AttentionCandidate[]>;

  // Fast path for the navigation badge — counts items without full derivation.
  countAttentionTickets(): Promise<number>;
}
