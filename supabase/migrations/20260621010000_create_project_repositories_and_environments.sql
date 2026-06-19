create table if not exists public.project_repositories (
  id             uuid        primary key default gen_random_uuid(),

  project_id     uuid        not null references public.projects(id) on delete cascade,

  provider       text        not null default 'github',
  owner          text,
  name           text        not null,
  repo_url       text        not null,
  default_branch text,
  notes          text,

  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

alter table public.project_repositories
  add constraint project_repositories_provider_check
  check (provider in ('github', 'other'));

create index if not exists project_repositories_project_id_idx on public.project_repositories(project_id);
create index if not exists project_repositories_provider_idx   on public.project_repositories(provider);

alter table public.project_repositories enable row level security;

create trigger project_repositories_set_updated_at
  before update on public.project_repositories
  for each row execute function public.set_updated_at();


create table if not exists public.project_environments (
  id          uuid        primary key default gen_random_uuid(),

  project_id  uuid        not null references public.projects(id) on delete cascade,

  name        text        not null,
  type        text        not null default 'development',
  url         text,
  status      text        not null default 'active',
  notes       text,

  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.project_environments
  add constraint project_environments_type_check
  check (type in ('development', 'staging', 'production', 'demo', 'other'));

alter table public.project_environments
  add constraint project_environments_status_check
  check (status in ('active', 'inactive', 'degraded'));

create index if not exists project_environments_project_id_idx on public.project_environments(project_id);
create index if not exists project_environments_type_idx       on public.project_environments(type);
create index if not exists project_environments_status_idx     on public.project_environments(status);

alter table public.project_environments enable row level security;

create trigger project_environments_set_updated_at
  before update on public.project_environments
  for each row execute function public.set_updated_at();
