export const CLIENT_STATUSES = ["active", "paused", "former"] as const;
export type ClientStatus = (typeof CLIENT_STATUSES)[number];

export interface Client {
  id: string;
  name: string;
  company: string | null;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  industry: string | null;
  status: ClientStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export type CreateClientInput = {
  name: string;
  company: string | null;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  industry: string | null;
  status: ClientStatus;
  notes: string | null;
};

export type CreateClientResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

export type UpdateClientInput = {
  name:         string;
  company:      string | null;
  contactName:  string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  industry:     string | null;
  status:       ClientStatus;
  notes:        string | null;
};

export type UpdateClientResult =
  | { ok: true }
  | { ok: false; error: string };

