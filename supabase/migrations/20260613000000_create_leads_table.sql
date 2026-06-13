create extension if not exists pgcrypto;

create table if not exists public.leads (
  id                  uuid        primary key default gen_random_uuid(),

  -- Required fields
  full_name           text        not null,
  email               text        not null,
  industry            text        not null,
  process_to_improve  text        not null,
  current_problem     text        not null,
  urgency             text        not null,
  budget              text        not null,

  -- Optional fields
  company             text,
  role                text,
  whatsapp            text,
  company_size        text,
  current_tools       text[]      not null default '{}',
  weekly_hours_lost   text,
  additional_message  text,

  -- Metadata
  status              text        not null default 'new',
  source              text        not null default 'website',

  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- Indexes
create index if not exists leads_status_idx     on public.leads(status);
create index if not exists leads_created_at_idx on public.leads(created_at desc);
create index if not exists leads_email_idx      on public.leads(email);

-- RLS: server-side insert via service role key only
alter table public.leads enable row level security;

-- No public read/write policies. Dashboard access defined in v0.5.0.

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger leads_set_updated_at
  before update on public.leads
  for each row execute function public.set_updated_at();
