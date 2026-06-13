export type LeadStatus = "new";
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
  source: LeadSource;
  createdAt: string;
  updatedAt: string;
}

export type CreateLeadResult =
  | { ok: true; id: string }
  | { ok: false; error: string };
