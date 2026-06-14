create table if not exists public.lead_notes (
  id          uuid        primary key default gen_random_uuid(),
  lead_id     uuid        not null references public.leads(id) on delete cascade,
  content     text        not null,
  created_by  text,
  created_at  timestamptz not null default now()
);

create index if not exists lead_notes_lead_id_idx    on public.lead_notes(lead_id);
create index if not exists lead_notes_created_at_idx on public.lead_notes(created_at desc);

-- RLS: server-side access via service role key only
alter table public.lead_notes enable row level security;
