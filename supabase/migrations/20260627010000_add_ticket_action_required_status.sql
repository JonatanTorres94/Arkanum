-- Add 'action_required' to the support_tickets status check constraint.
-- This status signals that the Soporte operator must respond to a development intervention request.
alter table public.support_tickets
  drop constraint if exists support_tickets_status_check;

alter table public.support_tickets
  add constraint support_tickets_status_check
  check (status in (
    'new',
    'triage',
    'waiting_client',
    'waiting_internal',
    'escalated_to_development',
    'action_required',
    'resolved',
    'closed',
    'cancelled'
  ));
