import type { AttentionItem, AttentionItemKind } from "@/features/operations/domain/attention-item.types";
import {
  ATTENTION_AUDIENCE_FOR_KIND,
  PRIORITY_SORT_WEIGHT,
} from "@/features/operations/domain/attention-item.types";
import type { AttentionCandidate, AttentionItemRepository } from "@/features/operations/infrastructure/attention-item.repository";
import type { TicketPriority } from "@/features/support/domain/support-ticket.types";

export type GetAttentionItemsResult =
  | { ok: true;  items: AttentionItem[] }
  | { ok: false; error: string };

// ─── Derivation helpers ───────────────────────────────────────────────────────

function candidateToItems(candidate: AttentionCandidate): AttentionItem[] {
  const { ticket, workItem, workItemMissing } = candidate;
  const items: AttentionItem[] = [];

  // Integrity: ticket references a work item that doesn't exist.
  if (workItemMissing) {
    items.push(makeItem(
      `integrity-missing-${ticket.id}`,
      "integrity_missing_work_item",
      ticket.id,
      ticket.title,
      ticket.priority,
      null,
      null,
      `/admin/support/${ticket.id}`,
      ticket.updatedAt,
    ));
    // Still check for other attention conditions below (the ticket may also have action_required).
  }

  // Integrity: escalated ticket with no linked work item reference.
  if (ticket.status === "escalated_to_development" && !ticket.escalatedWorkItemId) {
    items.push(makeItem(
      `integrity-orphan-${ticket.id}`,
      "integrity_orphan_escalation",
      ticket.id,
      ticket.title,
      ticket.priority,
      null,
      null,
      `/admin/support/${ticket.id}`,
      ticket.updatedAt,
    ));
    return items;
  }

  // Support intervention pending: requires the valid pair
  // ticket.status === "action_required" AND workItem.status === "awaiting_support".
  // Any other combination signals an inconsistent workflow state → integrity item.
  if (ticket.status === "action_required") {
    // WI missing (workItemMissing already added integrity_missing_work_item above).
    if (workItemMissing || !workItem) {
      return items; // only the integrity_missing_work_item added earlier
    }

    // WI exists but is not in awaiting_support — inconsistent state.
    if (workItem.status !== "awaiting_support") {
      items.push(makeItem(
        `integrity-action-mismatch-${ticket.id}`,
        "integrity_action_required_mismatch",
        ticket.id,
        ticket.title,
        ticket.priority,
        workItem.id,
        workItem.projectId,
        `/admin/support/${ticket.id}`,
        ticket.updatedAt,
      ));
      return items;
    }

    // Valid pair: ticket=action_required, WI=awaiting_support.
    items.push(makeItem(
      `support-intervention-${ticket.id}`,
      "support_intervention_pending",
      ticket.id,
      ticket.title,
      ticket.priority,
      workItem.id,
      workItem.projectId,
      `/admin/support/${ticket.id}`,
      ticket.updatedAt,
    ));

    // From the Development side: their WI is waiting for Support's response.
    items.push(makeItem(
      `dev-intervention-active-${workItem.id}`,
      "development_intervention_active",
      ticket.id,
      ticket.title,
      ticket.priority,
      workItem.id,
      workItem.projectId,
      `/admin/projects/${workItem.projectId}/work-items/${workItem.id}`,
      workItem.updatedAt,
    ));

    return items;
  }

  // From here, ticket.status === "escalated_to_development" with a resolved intervention
  // (or a first-time escalation never interrupted).
  if (!workItem) return items;

  if (workItem.status === "done") {
    // Support must validate completed development work.
    items.push(makeItem(
      `support-validation-${ticket.id}`,
      "support_validation_pending",
      ticket.id,
      ticket.title,
      ticket.priority,
      workItem.id,
      workItem.projectId,
      `/admin/support/${ticket.id}`,
      workItem.updatedAt,
    ));
    return items;
  }

  if (workItem.status === "cancelled") {
    // Support must decide the next step after Development cancelled.
    items.push(makeItem(
      `support-cancellation-${ticket.id}`,
      "support_cancellation_review",
      ticket.id,
      ticket.title,
      ticket.priority,
      workItem.id,
      workItem.projectId,
      `/admin/support/${ticket.id}`,
      workItem.updatedAt,
    ));
    return items;
  }

  return items;
}

function makeItem(
  id:                string,
  kind:              AttentionItemKind,
  ticketId:          string,
  ticketTitle:       string,
  ticketPriority:    TicketPriority,
  workItemId:        string | null,
  workItemProjectId: string | null,
  href:              string,
  updatedAt:         string,
): AttentionItem {
  return {
    id,
    kind,
    audience:          ATTENTION_AUDIENCE_FOR_KIND[kind],
    ticketId,
    ticketTitle,
    ticketPriority,
    workItemId,
    workItemProjectId,
    href,
    updatedAt,
  };
}

// ─── Sorting ──────────────────────────────────────────────────────────────────

function sortItems(items: AttentionItem[]): AttentionItem[] {
  return [...items].sort((a, b) => {
    const priorityDiff =
      PRIORITY_SORT_WEIGHT[a.ticketPriority] - PRIORITY_SORT_WEIGHT[b.ticketPriority];
    if (priorityDiff !== 0) return priorityDiff;
    // Secondary: oldest first (most overdue).
    if (a.updatedAt < b.updatedAt) return -1;
    if (a.updatedAt > b.updatedAt) return  1;
    // Tertiary: stable id-based tiebreaker.
    return a.id.localeCompare(b.id);
  });
}

// ─── Use case ─────────────────────────────────────────────────────────────────

export async function getAttentionItemsUseCase(
  repository: AttentionItemRepository
): Promise<GetAttentionItemsResult> {
  let candidates: AttentionCandidate[];

  try {
    candidates = await repository.findAttentionCandidates();
  } catch {
    return { ok: false, error: "No se pudo cargar la bandeja de atención." };
  }

  const items = sortItems(candidates.flatMap(candidateToItems));

  return { ok: true, items };
}

// ─── Nav badge use case ───────────────────────────────────────────────────────

// Returns the exact derived item count — same derivation as getAttentionItemsUseCase
// so the badge always matches what the inbox actually shows.
export async function getAttentionItemCountUseCase(
  repository: AttentionItemRepository
): Promise<number> {
  try {
    const candidates = await repository.findAttentionCandidates();
    return candidates.flatMap(candidateToItems).length;
  } catch {
    return 0; // fail-open: badge hides rather than breaks the layout
  }
}
