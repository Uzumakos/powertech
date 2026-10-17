-- Phase 6: legal details shown on the legal notice page, editable in "Paramètres".
alter table public.settings add column legal_form text;
alter table public.settings add column tax_id text;
alter table public.settings add column publication_director text;
alter table public.settings add column legal_address jsonb not null default '{}'::jsonb;
