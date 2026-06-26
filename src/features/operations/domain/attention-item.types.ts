import type { TicketPriority } from "@/features/support/domain/support-ticket.types";

// Each kind represents a distinct operational situation requiring attention.
export const ATTENTION_ITEM_KINDS = [
  // Specific Support workflow
  "support_intervention_pending",        // Support must respond to a Development intervention request
  "support_validation_pending",          // Support must validate completed development work
  "support_cancellation_review",         // Support must decide next step after Development cancelled
  // Specific Development workflow
  "development_intervention_active",     // Development's WI is waiting for Support response
  // Integrity
  "integrity_missing_work_item",         // escalatedWorkItemId is set but the WI doesn't exist in the DB
  "integrity_orphan_escalation",         // ticket is escalated_to_development but has no escalatedWorkItemId
  "integrity_action_required_mismatch",   // ticket is action_required but WI is NOT awaiting_support
  "integrity_awaiting_support_mismatch",  // WI is awaiting_support but ticket is NOT action_required
  // Generic active work (fallback when no specific state applies)
  "support_open_ticket",                 // active Support ticket with no specific pending action
  "development_open_work_item",          // active WI with no specific pending action
  "development_blocked_work_item",       // WI is blocked — needs unblocking
] as const;
export type AttentionItemKind = (typeof ATTENTION_ITEM_KINDS)[number];

export type AttentionAudience = "support" | "development" | "integrity";

export const ATTENTION_AUDIENCE_FOR_KIND: Record<AttentionItemKind, AttentionAudience> = {
  support_intervention_pending:        "support",
  support_validation_pending:          "support",
  support_cancellation_review:         "support",
  development_intervention_active:     "development",
  integrity_missing_work_item:         "integrity",
  integrity_orphan_escalation:         "integrity",
  integrity_action_required_mismatch:   "integrity",
  integrity_awaiting_support_mismatch:  "integrity",
  support_open_ticket:                 "support",
  development_open_work_item:          "development",
  development_blocked_work_item:       "development",
};

export const ATTENTION_KIND_LABELS: Record<AttentionItemKind, string> = {
  support_intervention_pending:        "Intervención pendiente",
  support_validation_pending:          "Validación de Desarrollo",
  support_cancellation_review:         "Cancelación para revisar",
  development_intervention_active:     "Intervención activa",
  integrity_missing_work_item:         "Work item faltante",
  integrity_orphan_escalation:         "Escalación huérfana",
  integrity_action_required_mismatch:   "Estado inconsistente",
  integrity_awaiting_support_mismatch:  "WI en espera sin intervención activa",
  support_open_ticket:                 "Ticket de Soporte abierto",
  development_open_work_item:          "Trabajo de Desarrollo activo",
  development_blocked_work_item:       "Trabajo de Desarrollo bloqueado",
};

export const ATTENTION_AUDIENCE_LABELS: Record<AttentionAudience, string> = {
  support:     "Soporte",
  development: "Desarrollo",
  integrity:   "Integridad",
};

// Primary sort key: higher specificity items appear before generic ones.
export const ATTENTION_KIND_SORT_WEIGHT: Record<AttentionItemKind, number> = {
  integrity_missing_work_item:         0,
  integrity_orphan_escalation:         0,
  integrity_action_required_mismatch:   0,
  integrity_awaiting_support_mismatch:  0,
  support_intervention_pending:        1,
  development_intervention_active:     1,
  support_validation_pending:          2,
  support_cancellation_review:         2,
  development_blocked_work_item:       3,
  support_open_ticket:                 4,
  development_open_work_item:          4,
};

export const PRIORITY_SORT_WEIGHT: Record<TicketPriority, number> = {
  urgent: 0,
  high:   1,
  medium: 2,
  low:    3,
};

export interface AttentionItem {
  id:                string;
  kind:              AttentionItemKind;
  audience:          AttentionAudience;
  // Ticket context — null for standalone WI items with no linked ticket.
  ticketId:          string | null;
  // Work item context — null for ticket-only items.
  workItemId:        string | null;
  workItemProjectId: string | null;
  // Unified display fields. For ticket items: ticket title/priority.
  // For standalone WI items: WI title/priority (same value set).
  title:             string;
  priority:          TicketPriority;
  href:              string;
  updatedAt:         string;
}
