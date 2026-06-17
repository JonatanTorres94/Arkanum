export type LeadEventType = "status_changed";

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
