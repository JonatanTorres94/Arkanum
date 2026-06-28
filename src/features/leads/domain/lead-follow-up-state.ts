import type { Lead } from "./lead.types";

export type LeadFollowUpState = "overdue" | "today" | "scheduled" | "missing";

type FollowUpInput = Pick<Lead, "followUpDate">;

// today must be a YYYY-MM-DD string (same format as followUpDate).
// Accepting it as a parameter keeps the function pure and testable without
// mocking the clock.
export function deriveLeadFollowUpState(
  lead: FollowUpInput,
  today: string,
): LeadFollowUpState {
  if (!lead.followUpDate) return "missing";
  if (lead.followUpDate < today) return "overdue";
  if (lead.followUpDate === today) return "today";
  return "scheduled";
}
