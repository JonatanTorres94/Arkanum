create table if not exists public.projects (
  id            uuid        primary key default gen_random_uuid(),

  client_id     uuid        not null references public.clients(id) on delete restrict,

  name          text        not null,
  description   text,
  status        text        not null default 'planning',
  start_date    date,
  target_date   date,
  notes         text,

  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table public.projects
  add constraint projects_status_check
  check (status in (
    'discovery',
    'planning',
    'in_development',
    'testing',
    'deployed',
    'maintenance',
    'paused',
    'cancelled'
  ));

create index if not exists projects_client_id_idx  on public.projects(client_id);
create index if not exists projects_status_idx     on public.projects(status);
create index if not exists projects_created_at_idx on public.projects(created_at desc);

-- RLS: server-side access via service role key only, same as leads/clients.
alter table public.projects enable row level security;

create trigger projects_set_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();
