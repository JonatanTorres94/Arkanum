create table if not exists public.support_tickets (
  id            uuid        primary key default gen_random_uuid(),

  client_id     uuid        not null references public.clients(id) on delete restrict,
  project_id    uuid        references public.projects(id) on delete set null,

  title         text        not null,
  description   text,
  notes         text,
  reported_by   text,

  source        text        not null default 'manual',
  category      text        not null default 'question',
  status        text        not null default 'new',
  priority      text        not null default 'medium',

  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  resolved_at   timestamptz
);

alter table public.support_tickets
  add constraint support_tickets_source_check
  check (source in ('email', 'whatsapp', 'manual', 'client_portal', 'internal'));

alter table public.support_tickets
  add constraint support_tickets_category_check
  check (category in (
    'question',
    'configuration',
    'bug_report',
    'incident',
    'change_request',
    'training',
    'billing',
    'access_issue'
  ));

alter table public.support_tickets
  add constraint support_tickets_status_check
  check (status in (
    'new',
    'triage',
    'waiting_client',
    'waiting_internal',
    'escalated_to_development',
    'resolved',
    'closed',
    'cancelled'
  ));

alter table public.support_tickets
  add constraint support_tickets_priority_check
  check (priority in ('low', 'medium', 'high', 'urgent'));

create index if not exists support_tickets_client_id_idx  on public.support_tickets(client_id);
create index if not exists support_tickets_project_id_idx on public.support_tickets(project_id);
create index if not exists support_tickets_status_idx     on public.support_tickets(status);
create index if not exists support_tickets_category_idx   on public.support_tickets(category);
create index if not exists support_tickets_priority_idx   on public.support_tickets(priority);
create index if not exists support_tickets_created_at_idx on public.support_tickets(created_at desc);

-- RLS: server-side access via service role key only, same as the rest of the domain.
alter table public.support_tickets enable row level security;

create trigger support_tickets_set_updated_at
  before update on public.support_tickets
  for each row execute function public.set_updated_at();
