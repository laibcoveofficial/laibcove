-- Run this in the Supabase SQL editor.
-- All writes/reads go through the service-role key on the server,
-- so RLS is enabled but no public policies are needed.

create extension if not exists "pgcrypto";

-- =========================================================================
-- LEADS  (custom-order requests from the contact form)
-- =========================================================================
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  full_name      text not null,
  email          text not null,
  phone          text not null,
  location       text,

  product_types  text,
  description    text not null,
  colors         text,
  size           text,
  quantity       int default 1,
  budget         text,
  deadline       date,
  purpose        text,
  custom_text    text,
  material       text,

  contact_method text,
  notes          text,

  status text not null default 'new'
    check (status in ('new', 'contacted', 'quoted', 'in_progress', 'completed', 'cancelled'))
);

create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_status_idx     on public.leads (status);

alter table public.leads enable row level security;

-- =========================================================================
-- CATEGORIES  (shop categories — manageable from admin)
-- =========================================================================
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  slug text unique not null,
  name text not null,
  description text,
  image_url text,
  display_order int not null default 0
);

create index if not exists categories_order_idx on public.categories (display_order asc);

alter table public.categories enable row level security;

-- Seed default categories (idempotent).
insert into public.categories (slug, name, description, display_order) values
  ('bags',       'Bags',        'Totes, crossbody, market bags & more',    1),
  ('plushies',   'Plushies',    'Cuddle companions made one stitch at a time', 2),
  ('clothing',   'Clothing',    'Tops, cardigans, dresses & accessories',  3),
  ('baby',       'Baby Items',  'Soft, safe, handmade for the littlest ones', 4),
  ('home-decor', 'Home Decor',  'Pillows, throws, wall hangings & more',   5),
  ('keychains',  'Keychains',   'Tiny crochet companions for keys & bags', 6),
  ('flowers',    'Flowers',     'Forever bouquets — never wilt, always pretty', 7),
  ('blankets',   'Blankets',    'Cozy, oversized, made to last',           8)
on conflict (slug) do nothing;

-- =========================================================================
-- PRODUCTS  (shop items — manageable from admin)
-- =========================================================================
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Core fields
  name        text not null,
  slug        text unique,
  description text not null default '',
  price_pkr           numeric(10, 2) not null default 0,
  compare_at_price_pkr numeric(10, 2),

  -- Categorization
  category_slug text references public.categories (slug) on delete set null,

  -- Placement flags — admin controls where this product appears
  is_new_arrival bool not null default false,
  is_best_seller bool not null default false,
  is_featured    bool not null default false,
  is_published   bool not null default true,

  -- Media
  images    jsonb not null default '[]'::jsonb,  -- array of public URLs
  video_url text,

  -- Inventory / state
  stock  int not null default 0,
  status text not null default 'available'
    check (status in ('available', 'sold_out', 'archived'))
);

create index if not exists products_category_idx     on public.products (category_slug);
create index if not exists products_published_idx    on public.products (is_published);
create index if not exists products_new_arrival_idx  on public.products (is_new_arrival);
create index if not exists products_best_seller_idx  on public.products (is_best_seller);
create index if not exists products_created_at_idx   on public.products (created_at desc);

alter table public.products enable row level security;

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- =========================================================================
-- STORAGE  (product images bucket)
-- =========================================================================
-- Run this once after the tables. Creates a public bucket for product images.
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;
