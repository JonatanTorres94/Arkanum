import type { AttentionItem, AttentionItemKind } from "@/features/operations/domain/attention-item.types";
import {
  ATTENTION_AUDIENCE_FOR_KIND,
  ATTENTION_KIND_SORT_WEIGHT,
  PRIORITY_SORT_WEIGHT,
} from "@/features/operations/domain/attention-item.types";
import type {
  AttentionCandidate,
  AttentionItemRepository,
  TicketCandidate,
} from "@/features/operations/infrastructure/attention-item.repository";
import type { TicketPriority } from "@/features/support/domain/support-ticket.types";
import type { ProjectWorkItem } from "@/features/projects/domain/project-work-item.types";

export type GetAttentionItemsResult =
  | { ok: true;  items: AttentionItem[] }
  | { ok: false; error: string };

// ─── Item factory ─────────────────────────────────────────────────────────────

function makeItem(
  id:                string,
  kind:              AttentionItemKind,
  ticketId:          string | null,
  title:             string,
  priority:          TicketPriority,
  workItemId:        string | null,
  workItemProjectId: string | null,
  href:              string,
  updatedAt:         string,
): AttentionItem {
  return {
    id,
    kind,
    audience:         ATTENTION_AUDIENCE_FOR_KIND[kind],
    ticketId,
    title,
    priority,
    workItemId,
    workItemProjectId,
    href,
    updatedAt,
  };
}

// ─── Ticket candidate derivation ──────────────────────────────────────────────

function ticketCandidateToItems({ ticket, workItem, workItemMissing }: TicketCandidate): AttentionItem[] {
  const items: AttentionItem[] = [];

  // Integrity: ticket references a WI that doesn't exist in the DB.
  // This replaces all other items for this ticket — no generic fallback.
  if (workItemMissing) {
    items.push(makeItem(
      `integrity-missing-${ticket.id}`,
      "integrity_missing_work_item",
      ticket.id, ticket.title, ticket.priority,
      null, null,
      `/admin/support/${ticket.id}`,
      ticket.updatedAt,
    ));
    return items;
  }

  // Integrity: escalated ticket with no linked WI reference.
  if (ticket.status === "escalated_to_development" && !ticket.escalatedWorkItemId) {
    items.push(makeItem(
      `integrity-orphan-${ticket.id}`,
      "integrity_orphan_escalation",
      ticket.id, ticket.title, ticket.priority,
      null, null,
      `/admin/support/${ticket.id}`,
      ticket.updatedAt,
    ));
    return items;
  }

  // Support intervention: requires the valid pair ticket=action_required + WI=awaiting_support.
  // Any other combination is a workflow inconsistency → integrity item, no operational items.
  if (ticket.status === "action_required") {
    if (!workItem) {
      // Escalated but WI not found and not flagged as missing — data guard.
      items.push(makeItem(`integrity-missing-${ticket.id}`, "integrity_missing_work_item", ticket.id, ticket.title, ticket.priority, null, null, `/admin/support/${ticket.id}`, ticket.updatedAt));
      return items;
    }
    if (workItem.status !== "awaiting_support") {
      items.push(makeItem(`integrity-action-mismatch-${ticket.id}`, "integrity_action_required_mismatch", ticket.id, ticket.title, ticket.priority, workItem.id, workItem.projectId, `/admin/support/${ticket.id}`, ticket.updatedAt));
      return items;
    }
    // Valid pair: generate specific items for both audiences.
    items.push(makeItem(`support-intervention-${ticket.id}`, "support_intervention_pending", ticket.id, ticket.title, ticket.priority, workItem.id, workItem.projectId, `/admin/support/${ticket.id}`, ticket.updatedAt));
    items.push(makeItem(`dev-intervention-active-${workItem.id}`, "development_intervention_active", ticket.id, ticket.title, ticket.priority, workItem.id, workItem.projectId, `/admin/projects/${workItem.projectId}/work-items/${workItem.id}`, workItem.updatedAt));
    return items;
  }

  // From here: ticket is NOT action_required.

  if (!workItem) {
    // No linked WI — generic support ticket item.
    items.push(makeItem(`support-open-${ticket.id}`, "support_open_ticket", ticket.id, ticket.title, ticket.priority, null, null, `/admin/support/${ticket.id}`, ticket.updatedAt));
    return items;
  }

  // Ticket has a linked WI — specific workflow states first.
  if (workItem.status === "done") {
    items.push(makeItem(`support-validation-${ticket.id}`, "support_validation_pending", ticket.id, ticket.title, ticket.priority, workItem.id, workItem.projectId, `/admin/support/${ticket.id}`, workItem.updatedAt));
    return items;
  }

  if (workItem.status === "cancelled") {
    items.push(makeItem(`support-cancellation-${ticket.id}`, "support_cancellation_review", ticket.id, ticket.title, ticket.priority, workItem.id, workItem.projectId, `/admin/support/${ticket.id}`, workItem.updatedAt));
    return items;
  }

  // WI awaiting_support with a non-action_required ticket → inconsistent workflow state.
  // The valid pair (action_required + awaiting_support) is already handled above.
  // Dest: ticket page so Support can investigate and align the states.
  if (workItem.status === "awaiting_support") {
    items.push(makeItem(
      `integrity-awaiting-support-${workItem.id}`,
      "integrity_awaiting_support_mismatch",
      ticket.id, ticket.title, ticket.priority,
      workItem.id, workItem.projectId,
      `/admin/support/${ticket.id}`,
      workItem.updatedAt,
    ));
    return items;
  }

  // WI is in an active state — generic support ticket + development item.
  items.push(makeItem(`support-open-${ticket.id}`, "support_open_ticket", ticket.id, ticket.title, ticket.priority, workItem.id, workItem.projectId, `/admin/support/${ticket.id}`, ticket.updatedAt));
  items.push(...workItemToItems(workItem, ticket.id));

  return items;
}

// ─── Work item derivation (shared by ticket-linked and standalone paths) ──────

// ticketId: null for standalone WIs; non-null for WIs linked to a ticket.
// caller is responsible for ensuring awaiting_support WIs are not passed here
// (they are handled upstream as integrity items in both paths).
function workItemToItems(workItem: ProjectWorkItem, ticketId: string | null): AttentionItem[] {
  if (workItem.status === "awaiting_support") {
    // Standalone or linked to a non-action_required ticket → inconsistent state.
    return [makeItem(
      `integrity-awaiting-support-${workItem.id}`,
      "integrity_awaiting_support_mismatch",
      ticketId, workItem.title, workItem.priority as TicketPriority,
      workItem.id, workItem.projectId,
      `/admin/projects/${workItem.projectId}/work-items/${workItem.id}`,
      workItem.updatedAt,
    )];
  }
  if (workItem.status === "blocked") {
    return [makeItem(
      `dev-blocked-${workItem.id}`,
      "development_blocked_work_item",
      ticketId, workItem.title, workItem.priority as TicketPriority,
      workItem.id, workItem.projectId,
      `/admin/projects/${workItem.projectId}/work-items/${workItem.id}`,
      workItem.updatedAt,
    )];
  }
  return [makeItem(
    `dev-open-${workItem.id}`,
    "development_open_work_item",
    ticketId, workItem.title, workItem.priority as TicketPriority,
    workItem.id, workItem.projectId,
    `/admin/projects/${workItem.projectId}/work-items/${workItem.id}`,
    workItem.updatedAt,
  )];
}

// ─── Candidate dispatcher ─────────────────────────────────────────────────────

function candidateToItems(candidate: AttentionCandidate): AttentionItem[] {
  if (candidate.type === "standalone_work_item") {
    return workItemToItems(candidate.workItem, null);
  }
  return ticketCandidateToItems(candidate);
}

// ─── Sorting ──────────────────────────────────────────────────────────────────

function sortItems(items: AttentionItem[]): AttentionItem[] {
  return [...items].sort((a, b) => {
    // Primary: specificity (integrity > specific workflow > blocked > generic).
    const kindDiff = ATTENTION_KIND_SORT_WEIGHT[a.kind] - ATTENTION_KIND_SORT_WEIGHT[b.kind];
    if (kindDiff !== 0) return kindDiff;
    // Secondary: priority (urgent first).
    const priorityDiff = PRIORITY_SORT_WEIGHT[a.priority] - PRIORITY_SORT_WEIGHT[b.priority];
    if (priorityDiff !== 0) return priorityDiff;
    // Tertiary: oldest first (most overdue).
    if (a.updatedAt < b.updatedAt) return -1;
    if (a.updatedAt > b.updatedAt) return  1;
    // Quaternary: stable id-based tiebreaker.
    return a.id.localeCompare(b.id);
  });
}

// ─── Use cases ────────────────────────────────────────────────────────────────

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
