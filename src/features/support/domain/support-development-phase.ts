import type { SupportTicket } from "./support-ticket.types";
import type { ProjectWorkItem } from "@/features/projects/domain/project-work-item.types";
import { OPEN_WORK_ITEM_STATUSES } from "@/features/projects/domain/project-lifecycle";

export type SupportDevelopmentPhase =
  | "not_escalated"
  | "development_in_progress"
  | "support_action_required"
  | "pending_support_validation"
  | "development_cancelled";

// OPEN_WORK_ITEM_STATUSES includes 'awaiting_support', so we exclude it here
// to avoid classifying intervention-requested items as generic "in progress".
const OPEN_EXCLUDING_AWAITING = new Set<string>(
  OPEN_WORK_ITEM_STATUSES.filter((s) => s !== "awaiting_support")
);

// Pure derivation — no IO.
// Returns "not_escalated" when workItem is null regardless of ticket fields,
// which covers both "never escalated" and "escalated but work item missing".
// Callers that need to distinguish the missing-reference case should check
// ticket.escalatedWorkItemId separately.
export function deriveDevelopmentPhase(
  ticket: SupportTicket,
  workItem: ProjectWorkItem | null
): SupportDevelopmentPhase {
  if (!ticket.escalatedWorkItemId || !workItem) return "not_escalated";
  if (workItem.status === "awaiting_support")    return "support_action_required";
  if (OPEN_EXCLUDING_AWAITING.has(workItem.status)) return "development_in_progress";
  if (workItem.status === "done")               return "pending_support_validation";
  return "development_cancelled"; // cancelled
}
