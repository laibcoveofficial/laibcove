-- Run this in the Supabase SQL editor.
-- All writes/reads go through the service-role key on the server,
-- so RLS is enabled but no public policies are needed.

create extension if not exists "pgcrypto" with schema extensions;

-- =========================================================================
-- ADMINS  (admin users — credentials live in the database, not in env)
-- =========================================================================
create table if not exists public.admins (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  email         text unique not null,
  password_hash text not null,
  full_name     text,
  is_active     bool not null default true
);

create unique index if not exists admins_email_idx on public.admins (lower(email));

alter table public.admins enable row level security;

-- Verify admin credentials. Returns the admin row if email + password match
-- (uses pgcrypto's bcrypt comparison), otherwise returns nothing.
-- security definer + locked search_path so the service-role client can call it
-- without needing direct select on the admins table.
create or replace function public.verify_admin(p_email text, p_password text)
returns table(id uuid, email text)
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  return query
  select a.id, a.email
  from public.admins a
  where lower(a.email) = lower(p_email)
    and a.is_active = true
    and a.password_hash = crypt(p_password, a.password_hash);
end;
$$;

revoke all on function public.verify_admin(text, text) from public;
grant execute on function public.verify_admin(text, text) to anon, authenticated, service_role;

-- Seed the first admin. Replace the email/password before running.
-- Re-run safely: on conflict it just updates the password.
--
--   insert into public.admins (email, password_hash)
--   values (
--     'admin@laibcove.com',
--     crypt('change-me-now', gen_salt('bf', 12))
--   )
--   on conflict (email) do update
--     set password_hash = excluded.password_hash,
--         is_active = true,
--         updated_at = now();

drop trigger if exists admins_set_updated_at on public.admins;
create trigger admins_set_updated_at
  before update on public.admins
  for each row execute function public.set_updated_at();

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
  ('gajre',      'Gajre',       'Traditional crochet wristlets & garlands', 2),
  ('clothing',   'Clothing',    'Tops, cardigans, dresses & accessories',  3),
  ('baby',       'Baby Items',  'Soft, safe, handmade for the littlest ones', 4),
  ('home-decor', 'Home Decor',  'Pillows, throws, wall hangings & more',   5),
  ('keychains',  'Keychains',   'Tiny crochet companions for keys & bags', 6),
  ('flowers',    'Flowers',     'Forever stems — never wilt, always pretty', 7),
  ('bouquets',   'Bouquets',    'Handcrafted arrangements for every occasion', 8)
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
on conflict (id) do update set public = true;

-- IMPORTANT: even when bucket.public = true, anonymous reads need a SELECT
-- policy on storage.objects. Without this, <img src="..."> requests 403/400.
-- Drop & recreate so this is idempotent.
drop policy if exists "Public read product-images" on storage.objects;
create policy "Public read product-images"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'product-images');

-- =========================================================================
-- CUSTOMERS  (one row per unique buyer, dedup by email/phone)
-- =========================================================================
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  full_name text not null,
  email     text not null,
  phone     text not null,

  total_orders   int            not null default 0,
  total_spent_pkr numeric(12,2) not null default 0
);

create unique index if not exists customers_email_idx on public.customers (lower(email));
create index if not exists customers_phone_idx on public.customers (phone);

alter table public.customers enable row level security;

drop trigger if exists customers_set_updated_at on public.customers;
create trigger customers_set_updated_at
  before update on public.customers
  for each row execute function public.set_updated_at();

-- =========================================================================
-- COUPONS  (discount codes — admin-managed, optional on checkout)
-- =========================================================================
create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  code text unique not null,
  description text,

  -- 'percent' uses value as % (1-100). 'flat' uses value as PKR off.
  type  text not null check (type in ('percent','flat')),
  value numeric(10,2) not null check (value >= 0),

  min_order_pkr   numeric(10,2) not null default 0,
  max_discount_pkr numeric(10,2),

  starts_at  timestamptz,
  expires_at timestamptz,

  usage_limit int,
  times_used  int not null default 0,

  is_active bool not null default true
);

create index if not exists coupons_code_idx     on public.coupons (lower(code));
create index if not exists coupons_active_idx   on public.coupons (is_active);

alter table public.coupons enable row level security;

-- =========================================================================
-- ORDERS
-- =========================================================================
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Human-readable order number (e.g. LCV-A8K2D9). Unique, generated on insert.
  order_number text unique not null,

  customer_id uuid references public.customers (id) on delete set null,

  -- Snapshot of customer details at time of order
  customer_name  text not null,
  customer_email text not null,
  customer_phone text not null,

  -- Shipping
  shipping_address text not null,
  city             text not null,
  postal_code      text,
  order_notes      text,

  -- Money (all PKR)
  subtotal_pkr  numeric(12,2) not null default 0,
  delivery_pkr  numeric(12,2) not null default 0,
  discount_pkr  numeric(12,2) not null default 0,
  total_pkr     numeric(12,2) not null default 0,

  -- Coupon snapshot
  coupon_code text,

  -- Payment
  payment_method text not null check (payment_method in ('jazzcash','easypaisa')),
  payment_status text not null default 'pending'
    check (payment_status in ('pending','paid','failed','refunded')),
  payment_reference   text,                -- buyer-provided TID
  payment_verified_at timestamptz,
  payment_notes       text,                -- admin notes (e.g. why failed)

  -- Order lifecycle
  order_status text not null default 'pending'
    check (order_status in (
      'pending','confirmed','processing','shipped','delivered','cancelled'
    ))
);

create index if not exists orders_created_at_idx     on public.orders (created_at desc);
create index if not exists orders_payment_status_idx on public.orders (payment_status);
create index if not exists orders_order_status_idx   on public.orders (order_status);
create index if not exists orders_customer_idx       on public.orders (customer_id);
create index if not exists orders_email_idx          on public.orders (lower(customer_email));

alter table public.orders enable row level security;

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

-- =========================================================================
-- ORDER_ITEMS  (line items for each order — snapshot product details)
-- =========================================================================
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  order_id   uuid not null references public.orders (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,

  -- Snapshot — stable even if the product is later edited/deleted
  product_name  text  not null,
  product_slug  text,
  product_image text,

  unit_price_pkr numeric(12,2) not null,
  quantity       int not null check (quantity > 0),
  line_total_pkr numeric(12,2) not null
);

create index if not exists order_items_order_idx   on public.order_items (order_id);
create index if not exists order_items_product_idx on public.order_items (product_id);

alter table public.order_items enable row level security;

-- =========================================================================
-- PAYMENTS  (payment attempts/events — immutable audit log)
-- =========================================================================
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  order_id uuid not null references public.orders (id) on delete cascade,

  method     text not null check (method in ('jazzcash','easypaisa')),
  status     text not null check (status in ('pending','paid','failed','refunded')),
  amount_pkr numeric(12,2) not null,

  reference text,    -- transaction id (buyer or gateway provided)
  notes     text     -- admin notes
);

create index if not exists payments_order_idx on public.payments (order_id);

alter table public.payments enable row level security;
