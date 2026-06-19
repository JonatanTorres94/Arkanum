export type LeadEventType = "status_changed" | "qualified_stage_changed" | "follow_up_updated";

// fromStatus/toStatus hold the previous/next status for "status_changed" events,
// the previous/next qualified_stage for "qualified_stage_changed" events, and a
// human-readable snapshot of (nextAction, followUpDate) for "follow_up_updated"
// events — the columns are generic on purpose so the audit trail can cover all three.
export interface LeadEvent {
  id:          string;
  leadId:      string;
  type:        LeadEventType;
  fromStatus:  string | null;
  toStatus:    string | null;
  createdBy:   string | null;
  createdAt:   string;
}

export type CreateLeadEventInput = {
  leadId:      string;
  type:        LeadEventType;
  fromStatus?: string | null;
  toStatus?:   string | null;
  createdBy?:  string | null;
};
