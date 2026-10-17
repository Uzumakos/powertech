-- Powertech — initial schema.
-- Run in the Supabase SQL editor (or `supabase db push`). Safe to read top to
-- bottom: content tables, lead tables, then row-level security.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Admin access
-- ---------------------------------------------------------------------------

-- A Supabase Auth user is an admin when listed here. Add one with:
--   insert into public.admins (user_id) select id from auth.users where email = 'you@example.com';
create table public.admins (
  user_id uuid primary key references auth.users on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Site content (localized text is jsonb: {"fr": "...", "en": "..."})
-- ---------------------------------------------------------------------------

-- Single row (id = 1). The company's age is computed from founded_year.
create table public.settings (
  id smallint primary key default 1 check (id = 1),
  company_name text not null default 'Powertech Services S.A.',
  founded_year int not null default 1993 check (founded_year between 1900 and 2100),
  phone text,
  whatsapp text,
  email text,
  address jsonb not null default '{}'::jsonb,
  hours jsonb not null default '{}'::jsonb,
  logo_url text,
  logo_dark_url text,
  hero_image_url text,
  hero_image_alt jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Library of media links (logos, photos, datasheets) pasted in the admin.
create table public.media (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  alt jsonb not null default '{}'::jsonb,
  kind text not null default 'photo' check (kind in ('logo', 'photo', 'partner', 'document')),
  created_at timestamptz not null default now()
);

create table public.partners (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_url text,
  website_url text,
  kind text not null default 'client' check (kind in ('client', 'brand')),
  sort_order int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name jsonb not null,
  description jsonb not null default '{}'::jsonb,
  kind text not null check (kind in ('ups', 'solar', 'battery', 'generator', 'component')),
  image_url text,
  sort_order int not null default 0
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  category_id uuid references public.categories on delete set null,
  name jsonb not null,
  summary jsonb not null default '{}'::jsonb,
  description jsonb not null default '{}'::jsonb,
  -- [{"key": "power", "label": {"fr": "Puissance", "en": "Power"}, "value": "120", "unit": "kVA"}]
  specs jsonb not null default '[]'::jsonb,
  image_urls text[] not null default '{}',
  datasheet_url text,
  stock_status text not null default 'in_stock' check (stock_status in ('in_stock', 'on_order', 'preorder')),
  lead_time jsonb not null default '{}'::jsonb,
  preorder_enabled boolean not null default false,
  featured boolean not null default false,
  active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index products_category_idx on public.products (category_id);

create table public.services (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name jsonb not null,
  summary jsonb not null default '{}'::jsonb,
  description jsonb not null default '{}'::jsonb,
  image_url text,
  sort_order int not null default 0,
  active boolean not null default true
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  client text not null,
  title jsonb not null,
  summary jsonb not null default '{}'::jsonb,
  image_url text,
  year int,
  sort_order int not null default 0,
  active boolean not null default true
);

create trigger settings_touch before update on public.settings
  for each row execute function public.touch_updated_at();
create trigger products_touch before update on public.products
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Leads (written by the server with the service-role key, read in the admin)
-- ---------------------------------------------------------------------------

create table public.quote_requests (
  id uuid primary key default gen_random_uuid(),
  org_type text check (org_type in ('institution', 'business', 'residential')),
  solutions text[] not null default '{}',
  name text not null,
  company text,
  email text,
  phone text not null,
  contact_pref text not null default 'call' check (contact_pref in ('call', 'whatsapp', 'email')),
  city text,
  message text,
  locale text not null default 'fr',
  status text not null default 'new' check (status in ('new', 'in_progress', 'quoted', 'won', 'lost')),
  created_at timestamptz not null default now()
);

create table public.quote_items (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.quote_requests on delete cascade,
  product_id uuid references public.products on delete set null,
  service_id uuid references public.services on delete set null,
  label text not null,
  quantity int not null default 1 check (quantity > 0),
  notes text
);
create index quote_items_request_idx on public.quote_items (request_id);

create table public.preorders (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products on delete set null,
  product_label text not null,
  quantity int not null default 1 check (quantity > 0),
  desired_date date,
  name text not null,
  company text,
  email text,
  phone text not null,
  contact_pref text not null default 'call' check (contact_pref in ('call', 'whatsapp', 'email')),
  message text,
  locale text not null default 'fr',
  status text not null default 'new' check (status in ('new', 'confirmed', 'ordered', 'fulfilled', 'cancelled')),
  created_at timestamptz not null default now()
);
create index preorders_product_idx on public.preorders (product_id);

-- ---------------------------------------------------------------------------
-- Row-level security
-- Public visitors read published content only. Admins manage everything.
-- Leads have no public policy at all: only the server (service role) inserts.
-- ---------------------------------------------------------------------------

alter table public.admins enable row level security;
alter table public.settings enable row level security;
alter table public.media enable row level security;
alter table public.partners enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.services enable row level security;
alter table public.projects enable row level security;
alter table public.quote_requests enable row level security;
alter table public.quote_items enable row level security;
alter table public.preorders enable row level security;

create policy "admins read own row" on public.admins for select using (user_id = auth.uid());

create policy "public read" on public.settings for select using (true);
create policy "public read" on public.categories for select using (true);
create policy "public read active" on public.partners for select using (active);
create policy "public read active" on public.products for select using (active);
create policy "public read active" on public.services for select using (active);
create policy "public read active" on public.projects for select using (active);

create policy "admin all" on public.settings for all using (public.is_admin()) with check (public.is_admin());
create policy "admin all" on public.media for all using (public.is_admin()) with check (public.is_admin());
create policy "admin all" on public.partners for all using (public.is_admin()) with check (public.is_admin());
create policy "admin all" on public.categories for all using (public.is_admin()) with check (public.is_admin());
create policy "admin all" on public.products for all using (public.is_admin()) with check (public.is_admin());
create policy "admin all" on public.services for all using (public.is_admin()) with check (public.is_admin());
create policy "admin all" on public.projects for all using (public.is_admin()) with check (public.is_admin());
create policy "admin all" on public.quote_requests for all using (public.is_admin()) with check (public.is_admin());
create policy "admin all" on public.quote_items for all using (public.is_admin()) with check (public.is_admin());
create policy "admin all" on public.preorders for all using (public.is_admin()) with check (public.is_admin());
