-- Product color variations + quantity-tier pricing.
--
-- Both columns are nullable jsonb. Null = legacy behaviour:
--   * `variants` null/empty  -> no color picker on product page; cart stores no variant name.
--   * `price_tiers` null/empty -> use products.price_pkr for every quantity.
--
-- Expected shapes (validated server-side, not by Postgres):
--   variants:    [{ "name": "Red", "color_hex": "#ff0000" | null, "image_url": "https://..." | null, "stock": 5 | null }]
--   price_tiers: [{ "min_qty": 2, "price_pkr": 900 }, { "min_qty": 5, "price_pkr": 800 }]
--
-- Tier resolution: pick the highest min_qty whose value <= ordered qty. If none match,
-- fall back to products.price_pkr.

alter table public.products
  add column if not exists variants    jsonb,
  add column if not exists price_tiers jsonb;

-- order_items snapshot the selected variant name at order time so reports stay correct
-- even if the product's variant list is later edited.
alter table public.order_items
  add column if not exists variant_name text;
