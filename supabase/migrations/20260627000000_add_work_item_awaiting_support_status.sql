-- Add 'awaiting_support' to the project_work_items status check constraint.
-- This status is exclusively managed by the development→support intervention flow.
alter table public.project_work_items
  drop constraint if exists project_work_items_status_check;

alter table public.project_work_items
  add constraint project_work_items_status_check
  check (status in (
    'backlog',
    'ready',
    'in_progress',
    'blocked',
    'review',
    'testing',
    'awaiting_support',
    'done',
    'cancelled'
  ));
