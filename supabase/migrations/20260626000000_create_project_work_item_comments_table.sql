create table if not exists public.project_work_item_comments (
  id                 uuid        primary key default gen_random_uuid(),
  work_item_id       uuid        not null references public.project_work_items(id) on delete cascade,
  content            text        not null check (char_length(content) between 1 and 2000),
  visible_to_support boolean     not null default false,
  created_by         text,
  created_at         timestamptz not null default now()
);

comment on column public.project_work_item_comments.visible_to_support
  is 'When true, Soporte operators can read this comment via the support ticket handoff panel.';

create index if not exists project_work_item_comments_work_item_created_at_idx
  on public.project_work_item_comments(work_item_id, created_at asc);

create index if not exists project_work_item_comments_visible_support_idx
  on public.project_work_item_comments(work_item_id, created_at asc)
  where visible_to_support = true;

-- RLS: server-side access via service role key only, same as the rest of the domain.
alter table public.project_work_item_comments enable row level security;
