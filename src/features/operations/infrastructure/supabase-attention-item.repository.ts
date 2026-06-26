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
import type { AttentionCandidate, AttentionItemRepository } from "./attention-item.repository";

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

// ─── Repository ───────────────────────────────────────────────────────────────

const TERMINAL_STATUSES = ["resolved", "closed", "cancelled"];

export class SupabaseAttentionItemRepository implements AttentionItemRepository {
  async findAttentionCandidates(): Promise<AttentionCandidate[]> {
    const supabase = createServerClient();

    // Fetch all non-terminal tickets that are potentially actionable:
    // - action_required: Development requested Support intervention
    // - escalated_to_development: active escalations (includes all phases)
    // - escalated_work_item_id set with any other open status: catches edge cases
    const { data: ticketRows, error: ticketError } = await supabase
      .from("support_tickets")
      .select("*")
      .not("status", "in", `(${TERMINAL_STATUSES.map((s) => `"${s}"`).join(",")})`)
      .or("status.eq.action_required,status.eq.escalated_to_development,escalated_work_item_id.not.is.null")
      .order("updated_at", { ascending: false })
      .returns<SupportTicketRow[]>();

    if (ticketError) throw new Error("SupabaseAttentionItemRepository: findAttentionCandidates tickets failed");

    const rows = ticketRows ?? [];
    if (rows.length === 0) return [];

    // Collect all referenced work item IDs.
    const workItemIds = [...new Set(
      rows.map((r) => r.escalated_work_item_id).filter((id): id is string => id !== null)
    )];

    // Fetch all referenced work items in a single query.
    let workItemMap = new Map<string, ProjectWorkItem>();
    if (workItemIds.length > 0) {
      const { data: wiRows, error: wiError } = await supabase
        .from("project_work_items")
        .select("*")
        .in("id", workItemIds)
        .returns<ProjectWorkItemRow[]>();

      if (wiError) throw new Error("SupabaseAttentionItemRepository: findAttentionCandidates work items failed");
      workItemMap = new Map((wiRows ?? []).map((r) => [r.id, workItemToDomain(r)]));
    }

    // Build candidates, flagging missing work items.
    return rows.map((row) => {
      const ticket         = ticketToDomain(row);
      const workItem       = row.escalated_work_item_id ? (workItemMap.get(row.escalated_work_item_id) ?? null) : null;
      const workItemMissing = row.escalated_work_item_id !== null && !workItemMap.has(row.escalated_work_item_id);
      return { ticket, workItem, workItemMissing };
    });
  }

  async countAttentionTickets(): Promise<number> {
    const supabase = createServerClient();

    const { count, error } = await supabase
      .from("support_tickets")
      .select("id", { count: "exact", head: true })
      .not("status", "in", `(${TERMINAL_STATUSES.map((s) => `"${s}"`).join(",")})`)
      .or("status.eq.action_required,status.eq.escalated_to_development,escalated_work_item_id.not.is.null");

    if (error) return 0; // fail-open: don't break the layout if the badge query fails
    return count ?? 0;
  }
}
