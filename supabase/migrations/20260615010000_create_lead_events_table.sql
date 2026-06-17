CREATE TABLE lead_events (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id     UUID        NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  type        TEXT        NOT NULL CHECK (type IN ('status_changed')),
  from_status TEXT,
  to_status   TEXT,
  created_by  TEXT,
  created_at  TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX lead_events_lead_id_idx ON lead_events (lead_id);

ALTER TABLE lead_events ENABLE ROW LEVEL SECURITY;
-- No public policies. Only the service role key can read/write.
