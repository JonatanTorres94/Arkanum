import type { SupportTicket } from "./support-ticket.types";
import type { ProjectWorkItem } from "@/features/projects/domain/project-work-item.types";
import { OPEN_WORK_ITEM_STATUSES } from "@/features/projects/domain/project-lifecycle";

export type SupportDevelopmentPhase =
  | "not_escalated"
  | "development_in_progress"
  | "pending_support_validation"
  | "development_cancelled";

const OPEN_SET = new Set<string>(OPEN_WORK_ITEM_STATUSES);

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
  if (OPEN_SET.has(workItem.status))         return "development_in_progress";
  if (workItem.status === "done")            return "pending_support_validation";
  return "development_cancelled"; // cancelled
}
