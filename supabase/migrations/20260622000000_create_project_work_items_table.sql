create table if not exists public.project_work_items (
  id          uuid        primary key default gen_random_uuid(),

  project_id  uuid        not null references public.projects(id) on delete cascade,

  title       text        not null,
  description text,
  category    text        not null default 'task',
  status      text        not null default 'backlog',
  priority    text        not null default 'medium',
  notes       text,

  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.project_work_items
  add constraint project_work_items_category_check
  check (category in (
    'feature',
    'bug',
    'task',
    'improvement',
    'technical_debt',
    'research',
    'support_escalation'
  ));

alter table public.project_work_items
  add constraint project_work_items_status_check
  check (status in (
    'backlog',
    'ready',
    'in_progress',
    'blocked',
    'review',
    'testing',
    'done',
    'cancelled'
  ));

alter table public.project_work_items
  add constraint project_work_items_priority_check
  check (priority in ('low', 'medium', 'high', 'urgent'));

create index if not exists project_work_items_project_id_idx  on public.project_work_items(project_id);
create index if not exists project_work_items_status_idx      on public.project_work_items(status);
create index if not exists project_work_items_category_idx    on public.project_work_items(category);
create index if not exists project_work_items_priority_idx    on public.project_work_items(priority);
create index if not exists project_work_items_created_at_idx  on public.project_work_items(created_at desc);

-- RLS: server-side access via service role key only, same as the rest of the domain.
alter table public.project_work_items enable row level security;

create trigger project_work_items_set_updated_at
  before update on public.project_work_items
  for each row execute function public.set_updated_at();
