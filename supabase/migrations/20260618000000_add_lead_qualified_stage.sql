alter table public.leads
  add column qualified_stage text;

alter table public.leads
  add constraint leads_qualified_stage_check
  check (qualified_stage is null or qualified_stage in (
    'discovery_pending',
    'proposal_pending',
    'proposal_sent',
    'waiting_client',
    'accepted',
    'rejected',
    'project_started'
  ));

create index if not exists leads_qualified_stage_idx on public.leads(qualified_stage);
