create table if not exists public.support_ticket_notes (
  id          uuid        primary key default gen_random_uuid(),
  ticket_id   uuid        not null references public.support_tickets(id) on delete cascade,
  content     text        not null,
  created_by  text,
  created_at  timestamptz not null default now()
);

create index if not exists support_ticket_notes_ticket_id_idx         on public.support_ticket_notes(ticket_id);
create index if not exists support_ticket_notes_ticket_created_at_idx on public.support_ticket_notes(ticket_id, created_at desc);

-- RLS: server-side access via service role key only, same as the rest of the domain.
alter table public.support_ticket_notes enable row level security;
