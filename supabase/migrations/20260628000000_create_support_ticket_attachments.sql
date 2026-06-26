-- Create private Storage bucket for ticket attachments.
-- If the storage schema is not available, create the bucket via the Supabase dashboard:
--   Bucket name: support-ticket-attachments | Public: false
INSERT INTO storage.buckets (id, name, public)
VALUES ('support-ticket-attachments', 'support-ticket-attachments', false)
ON CONFLICT (id) DO NOTHING;

-- Metadata table — source of truth for what files exist and their ownership.
CREATE TABLE public.support_ticket_attachments (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id    uuid        NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  filename     text        NOT NULL CHECK (char_length(filename) BETWEEN 1 AND 255),
  storage_key  text        NOT NULL UNIQUE,
  mime_type    text        NOT NULL,
  size_bytes   bigint      NOT NULL CHECK (size_bytes > 0 AND size_bytes <= 10485760),
  uploaded_by  text,
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.support_ticket_attachments ENABLE ROW LEVEL SECURITY;

-- Quick lookup by ticket, ordered chronologically.
CREATE INDEX idx_support_ticket_attachments_ticket_id
  ON public.support_ticket_attachments (ticket_id, created_at ASC);
