alter table public.leads
  add column next_action text,
  add column follow_up_date date;

create index if not exists leads_follow_up_date_idx on public.leads(follow_up_date);
