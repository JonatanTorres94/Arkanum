alter table public.lead_events
  drop constraint lead_events_type_check;

alter table public.lead_events
  add constraint lead_events_type_check
  check (type in ('status_changed', 'qualified_stage_changed', 'follow_up_updated', 'intent_fields_updated'));
