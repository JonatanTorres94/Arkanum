-- Prevents one development work item from being linked to multiple support tickets.
create unique index if not exists support_tickets_escalated_work_item_id_uidx
  on public.support_tickets(escalated_work_item_id)
  where escalated_work_item_id is not null;
