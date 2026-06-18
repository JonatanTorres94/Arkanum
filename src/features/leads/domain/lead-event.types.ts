export type LeadEventType = "status_changed" | "qualified_stage_changed";

// fromStatus/toStatus hold the previous/next status for "status_changed" events,
// and the previous/next qualified_stage for "qualified_stage_changed" events —
// the columns are generic on purpose so the audit trail can cover both.
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
