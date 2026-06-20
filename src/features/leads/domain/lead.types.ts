export const LEAD_STATUSES = ["new", "contacted", "qualified", "disqualified"] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const QUALIFIED_STAGES = [
  "discovery_pending",
  "proposal_pending",
  "proposal_sent",
  "waiting_client",
  "accepted",
  "rejected",
  "project_started",
] as const;
export type QualifiedStage = (typeof QUALIFIED_STAGES)[number];

export type LeadSource = "website";

export interface Lead {
  id: string;
  fullName: string;
  email: string;
  industry: string;
  processToImprove: string;
  currentProblem: string;
  urgency: string;
  budget: string;
  company: string | null;
  role: string | null;
  whatsapp: string | null;
  companySize: string | null;
  currentTools: string[];
  weeklyHoursLost: string | null;
  additionalMessage: string | null;
  status: LeadStatus;
  qualifiedStage: QualifiedStage | null;
  nextAction: string | null;
  followUpDate: string | null;
  source: LeadSource;
  createdAt: string;
  updatedAt: string;
  convertedToClient: boolean;
  convertedClientId: string | null;
  convertedProjectId: string | null;
  convertedAt: string | null;
  convertedBy: string | null;
}

export type LeadFollowUpInput = {
  nextAction: string | null;
  followUpDate: string | null;
};

export type LeadIntentFieldsInput = {
  industry: string;
  companySize: string;
  urgency: string;
  budget: string;
};

export type CreateLeadResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

export type UpdateLeadStatusResult =
  | { ok: true }
  | { ok: false; error: string };

export type UpdateLeadQualifiedStageResult =
  | { ok: true }
  | { ok: false; error: string };

export type UpdateLeadFollowUpResult =
  | { ok: true }
  | { ok: false; error: string };

export type UpdateLeadIntentFieldsResult =
  | { ok: true }
  | { ok: false; error: string };

export type ConvertLeadToClientInput = {
  clientId: string;
  projectId: string | null;
  convertedBy: string | null;
};

export type ConvertLeadToClientResult =
  | { ok: true }
  | { ok: false; error: string };
