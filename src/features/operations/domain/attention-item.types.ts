import type { TicketPriority } from "@/features/support/domain/support-ticket.types";

// Each kind represents a distinct operational situation requiring attention.
// Kinds are exclusive — one underlying event maps to exactly one kind.
export const ATTENTION_ITEM_KINDS = [
  "support_intervention_pending",     // Support must respond to a Development intervention request
  "support_validation_pending",       // Support must validate completed development work
  "support_cancellation_review",      // Support must decide next step after Development cancelled
  "development_intervention_active",  // Development's WI is waiting for Support response (informational)
  "integrity_missing_work_item",      // escalatedWorkItemId is set but the WI doesn't exist
  "integrity_orphan_escalation",      // ticket is escalated_to_development but has no escalatedWorkItemId
] as const;
export type AttentionItemKind = (typeof ATTENTION_ITEM_KINDS)[number];

export type AttentionAudience = "support" | "development" | "integrity";

export const ATTENTION_AUDIENCE_FOR_KIND: Record<AttentionItemKind, AttentionAudience> = {
  support_intervention_pending:    "support",
  support_validation_pending:      "support",
  support_cancellation_review:     "support",
  development_intervention_active: "development",
  integrity_missing_work_item:     "integrity",
  integrity_orphan_escalation:     "integrity",
};

export const ATTENTION_KIND_LABELS: Record<AttentionItemKind, string> = {
  support_intervention_pending:    "Intervención pendiente",
  support_validation_pending:      "Validación de Desarrollo",
  support_cancellation_review:     "Cancelación para revisar",
  development_intervention_active: "Intervención activa",
  integrity_missing_work_item:     "Work item faltante",
  integrity_orphan_escalation:     "Escalación huérfana",
};

export const ATTENTION_AUDIENCE_LABELS: Record<AttentionAudience, string> = {
  support:     "Soporte",
  development: "Desarrollo",
  integrity:   "Integridad",
};

export interface AttentionItem {
  id:                string;          // unique identifier for React key
  kind:              AttentionItemKind;
  audience:          AttentionAudience;
  ticketId:          string;
  ticketTitle:       string;
  ticketPriority:    TicketPriority;
  workItemId:        string | null;
  workItemProjectId: string | null;
  href:              string;          // primary CTA — where to navigate
  updatedAt:         string;          // ISO string; used for age calculation and sort
}

export const PRIORITY_SORT_WEIGHT: Record<TicketPriority, number> = {
  urgent: 0,
  high:   1,
  medium: 2,
  low:    3,
};
