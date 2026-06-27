alter table public.leads
  add column landing_path text,
  add column referrer     text,
  add column utm_source   text,
  add column utm_medium   text,
  add column utm_campaign text,
  add column utm_content  text,
  add column utm_term     text;
