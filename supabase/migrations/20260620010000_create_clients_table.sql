create table if not exists public.clients (
  id            uuid        primary key default gen_random_uuid(),

  name          text        not null,
  company       text,
  contact_name  text,
  contact_email text,
  contact_phone text,
  industry      text,
  status        text        not null default 'active',
  notes         text,

  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table public.clients
  add constraint clients_status_check
  check (status in ('active', 'paused', 'former'));

create index if not exists clients_status_idx     on public.clients(status);
create index if not exists clients_created_at_idx on public.clients(created_at desc);

-- RLS: server-side access via service role key only, same as leads.
alter table public.clients enable row level security;

create trigger clients_set_updated_at
  before update on public.clients
  for each row execute function public.set_updated_at();
