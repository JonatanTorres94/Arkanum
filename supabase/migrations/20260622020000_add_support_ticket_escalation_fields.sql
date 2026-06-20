alter table public.support_tickets
  add column escalated_work_item_id uuid references public.project_work_items(id) on delete set null,
  add column escalated_at           timestamptz,
  add column escalated_by           text;

create index if not exists support_tickets_escalated_work_item_id_idx on public.support_tickets(escalated_work_item_id);
create index if not exists support_tickets_escalated_at_idx           on public.support_tickets(escalated_at);
