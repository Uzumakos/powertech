-- Phase 3: everything editable from the admin.

-- Site texts edited in "Textes du site": one row per language holding the full
-- dictionary as edited. The site merges it over the built-in text, so keys
-- added in code later still appear with their default wording.
create table public.site_content (
  locale text primary key check (locale in ('fr', 'en')),
  content jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create trigger site_content_touch before update on public.site_content
  for each row execute function public.touch_updated_at();

alter table public.site_content enable row level security;
create policy "public read" on public.site_content for select using (true);
create policy "admin all" on public.site_content for all using (public.is_admin()) with check (public.is_admin());

-- Inbox for new quote requests and pre-orders (falls back to SALES_EMAIL).
alter table public.settings add column notification_email text;

-- Used by the per-phone rate limit on the public forms.
create index quote_requests_phone_created_idx on public.quote_requests (phone, created_at desc);
create index preorders_phone_created_idx on public.preorders (phone, created_at desc);
