export type LeadEventType =
  | "status_changed"
  | "qualified_stage_changed"
  | "follow_up_updated"
  | "intent_fields_updated"
  | "converted_to_client"
  | "converted_to_project";

// fromStatus/toStatus hold the previous/next status for "status_changed" events,
// the previous/next qualified_stage for "qualified_stage_changed" events, a
// human-readable snapshot of (nextAction, followUpDate) for "follow_up_updated"
// events, a snapshot of (industry, companySize, urgency, budget) for
// "intent_fields_updated" events, and a one-sided description (fromStatus is
// null) of the created client/project for "converted_to_client"/
// "converted_to_project" — the columns are generic on purpose so the audit
// trail can cover all of these without new schema.
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
