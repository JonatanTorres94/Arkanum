import { createServerClient } from "@/lib/supabase/server";
import type {
  TicketCategory,
  TicketPriority,
  TicketSource,
  TicketStatus,
  SupportTicket,
} from "@/features/support/domain/support-ticket.types";
import type {
  WorkItemCategory,
  WorkItemPriority,
  WorkItemStatus,
  ProjectWorkItem,
} from "@/features/projects/domain/project-work-item.types";
import type {
  AttentionCandidate,
  AttentionItemRepository,
  StandaloneWorkItemCandidate,
  TicketCandidate,
} from "./attention-item.repository";

// ─── DB row shapes ────────────────────────────────────────────────────────────

type SupportTicketRow = {
  id: string;
  client_id: string;
  project_id: string | null;
  title: string;
  description: string | null;
  notes: string | null;
  reported_by: string | null;
  source: string;
  category: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  escalated_work_item_id: string | null;
  escalated_at: string | null;
  escalated_by: string | null;
};

type ProjectWorkItemRow = {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  category: string;
  status: string;
  priority: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

// ─── Mappers ──────────────────────────────────────────────────────────────────

function ticketToDomain(row: SupportTicketRow): SupportTicket {
  return {
    id:                  row.id,
    clientId:            row.client_id,
    projectId:           row.project_id,
    title:               row.title,
    description:         row.description,
    notes:               row.notes,
    reportedBy:          row.reported_by,
    source:              row.source as TicketSource,
    category:            row.category as TicketCategory,
    status:              row.status as TicketStatus,
    priority:            row.priority as TicketPriority,
    createdAt:           row.created_at,
    updatedAt:           row.updated_at,
    resolvedAt:          row.resolved_at,
    escalatedWorkItemId: row.escalated_work_item_id,
    escalatedAt:         row.escalated_at,
    escalatedBy:         row.escalated_by,
  };
}

function workItemToDomain(row: ProjectWorkItemRow): ProjectWorkItem {
  return {
    id:          row.id,
    projectId:   row.project_id,
    title:       row.title,
    description: row.description,
    category:    row.category as WorkItemCategory,
    status:      row.status as WorkItemStatus,
    priority:    row.priority as WorkItemPriority,
    notes:       row.notes,
    createdAt:   row.created_at,
    updatedAt:   row.updated_at,
  };
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TERMINAL_TICKET_STATUSES = ["resolved", "closed", "cancelled"];

// Work item statuses that represent actionable active work.
// Excludes: backlog (not started, not actionable), done, cancelled (terminal/completed).
const ACTIVE_WI_STATUSES: WorkItemStatus[] = [
  "ready", "in_progress", "blocked", "review", "testing", "awaiting_support",
];

// ─── Repository ───────────────────────────────────────────────────────────────

export class SupabaseAttentionItemRepository implements AttentionItemRepository {
  async findAttentionCandidates(): Promise<AttentionCandidate[]> {
    const supabase = createServerClient();

    // Query 1: all non-terminal Support tickets.
    const { data: ticketRows, error: ticketError } = await supabase
      .from("support_tickets")
      .select("*")
      .not("status", "in", `(${TERMINAL_TICKET_STATUSES.map((s) => `"${s}"`).join(",")})`)
      .returns<SupportTicketRow[]>();

    if (ticketError) throw new Error("SupabaseAttentionItemRepository: ticket query failed");

    const tickets = (ticketRows ?? []).map(ticketToDomain);

    // Collect all WI IDs referenced by tickets (for cross-referencing).
    const linkedWiIds = [...new Set(
      tickets.map((t) => t.escalatedWorkItemId).filter((id): id is string => id !== null)
    )];

    // Query 2: all active work items (discovers standalone WIs and linked WIs in active states).
    const { data: activeWiRows, error: activeWiError } = await supabase
      .from("project_work_items")
      .select("*")
      .in("status", ACTIVE_WI_STATUSES)
      .returns<ProjectWorkItemRow[]>();

    if (activeWiError) throw new Error("SupabaseAttentionItemRepository: active WI query failed");

    const activeWiById = new Map(
      (activeWiRows ?? []).map((r) => [r.id, workItemToDomain(r)])
    );

    // Query 3 (conditional): ticket-linked WIs that are NOT in the active map.
    // These are WIs in done/cancelled state still relevant for Support workflow context
    // (e.g., support_validation_pending, support_cancellation_review).
    const inactiveLinkedIds = linkedWiIds.filter((id) => !activeWiById.has(id));
    let inactiveLinkedById = new Map<string, ProjectWorkItem>();
    if (inactiveLinkedIds.length > 0) {
      const { data: extraRows, error: extraError } = await supabase
        .from("project_work_items")
        .select("*")
        .in("id", inactiveLinkedIds)
        .returns<ProjectWorkItemRow[]>();

      if (extraError) throw new Error("SupabaseAttentionItemRepository: linked WI query failed");
      inactiveLinkedById = new Map((extraRows ?? []).map((r) => [r.id, workItemToDomain(r)]));
    }

    // Combined lookup for ticket-linked WIs (active takes precedence).
    const allLinkedWiById = new Map([...inactiveLinkedById, ...activeWiById]);

    // Ticket candidates: one per non-terminal ticket.
    const linkedWiIdSet = new Set(linkedWiIds);
    const ticketCandidates: TicketCandidate[] = tickets.map((ticket) => {
      const linkedId    = ticket.escalatedWorkItemId;
      const workItem    = linkedId ? (allLinkedWiById.get(linkedId) ?? null) : null;
      const workItemMissing = linkedId !== null && !allLinkedWiById.has(linkedId);
      return { type: "ticket", ticket, workItem, workItemMissing };
    });

    // Standalone WI candidates: active WIs not referenced by any non-terminal ticket.
    const standaloneWis: StandaloneWorkItemCandidate[] = [...activeWiById.values()]
      .filter((wi) => !linkedWiIdSet.has(wi.id))
      .map((wi) => ({ type: "standalone_work_item", workItem: wi }));

    return [...ticketCandidates, ...standaloneWis];
  }
}
