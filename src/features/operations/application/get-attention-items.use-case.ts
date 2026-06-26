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

  // Support intervention pending: Development requested Support response.
  // Ticket is action_required; WI is awaiting_support.
  if (ticket.status === "action_required") {
    items.push(makeItem(
      `support-intervention-${ticket.id}`,
      "support_intervention_pending",
      ticket.id,
      ticket.title,
      ticket.priority,
      workItem?.id ?? null,
      workItem?.projectId ?? null,
      `/admin/support/${ticket.id}`,
      ticket.updatedAt,
    ));

    // From the Development side: their WI is waiting for Support's response.
    if (workItem) {
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
    }

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
    return a.updatedAt < b.updatedAt ? -1 : a.updatedAt > b.updatedAt ? 1 : 0;
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

// Fast path: returns a raw ticket count (not derived items) for the nav badge.
// May slightly over- or under-count relative to the full derivation, which is
// acceptable for a badge — accuracy matters less than latency here.
export async function getAttentionItemCountUseCase(
  repository: AttentionItemRepository
): Promise<number> {
  try {
    return await repository.countAttentionTickets();
  } catch {
    return 0; // fail-open: badge hides rather than breaks the layout
  }
}
