alter table public.leads
  add column converted_to_client boolean     not null default false,
  add column converted_client_id uuid        references public.clients(id) on delete set null,
  add column converted_project_id uuid       references public.projects(id) on delete set null,
  add column converted_at         timestamptz,
  add column converted_by         text;

create index if not exists leads_converted_to_client_idx  on public.leads(converted_to_client);
create index if not exists leads_converted_client_id_idx  on public.leads(converted_client_id);
create index if not exists leads_converted_project_id_idx on public.leads(converted_project_id);
create index if not exists leads_converted_at_idx         on public.leads(converted_at desc);
