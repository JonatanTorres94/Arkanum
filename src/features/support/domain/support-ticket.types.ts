export const TICKET_SOURCES = ["email", "whatsapp", "manual", "client_portal", "internal"] as const;
export type TicketSource = (typeof TICKET_SOURCES)[number];

export const TICKET_CATEGORIES = [
  "question",
  "configuration",
  "bug_report",
  "incident",
  "change_request",
  "training",
  "billing",
  "access_issue",
] as const;
export type TicketCategory = (typeof TICKET_CATEGORIES)[number];

export const TICKET_STATUSES = [
  "new",
  "triage",
  "waiting_client",
  "waiting_internal",
  "escalated_to_development",
  "resolved",
  "closed",
  "cancelled",
] as const;
export type TicketStatus = (typeof TICKET_STATUSES)[number];

export const TICKET_PRIORITIES = ["low", "medium", "high", "urgent"] as const;
export type TicketPriority = (typeof TICKET_PRIORITIES)[number];

export interface SupportTicket {
  id: string;
  clientId: string;
  projectId: string | null;
  title: string;
  description: string | null;
  notes: string | null;
  reportedBy: string | null;
  source: TicketSource;
  category: TicketCategory;
  status: TicketStatus;
  priority: TicketPriority;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
  escalatedWorkItemId: string | null;
  escalatedAt: string | null;
  escalatedBy: string | null;
}

export type CreateSupportTicketInput = {
  clientId: string;
  projectId: string | null;
  title: string;
  description: string | null;
  notes: string | null;
  reportedBy: string | null;
  source: TicketSource;
  category: TicketCategory;
  status: TicketStatus;
  priority: TicketPriority;
};

export type CreateSupportTicketResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

export type UpdateSupportTicketStatusInput = {
  status: TicketStatus;
  resolvedAt: string | null;
};

export type UpdateSupportTicketStatusResult =
  | { ok: true }
  | { ok: false; error: string };

export type EscalateSupportTicketInput = {
  escalatedWorkItemId: string;
  escalatedAt: string;
  escalatedBy: string | null;
};

export type EscalateSupportTicketResult =
  | { ok: true }
  | { ok: false; error: string };
