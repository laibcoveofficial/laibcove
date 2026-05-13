import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles, Star } from "lucide-react";
import { AnnouncementBar } from "@/components/site/announcement-bar";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { ShopProductCard } from "@/components/shop/product-card";
import { SortSelect } from "@/components/shop/sort-select";
import { getSupabase } from "@/lib/supabase/server";
import type { Category, Product } from "@/lib/supabase/types";

export const metadata: Metadata = {
  title: "Shop — Handmade Crochet by Laibcove",
  description:
    "Browse our full collection of handmade crochet bags, gajray, bouquets, and home decor. Every piece stitched with love.",
};

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ category?: string; sort?: string }>;

export default async function ShopPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const activeCategory = sp?.category;
  const sort = sp?.sort ?? "newest";

  let categories: Category[] = [];
  let products: Product[] = [];
  let newArrivals: Product[] = [];
  let bestSellers: Product[] = [];
  let dbError: string | null = null;

  try {
    const supabase = getSupabase();

    let productQuery = supabase
      .from("products")
      .select("*")
      .eq("is_published", true);

    if (activeCategory) productQuery = productQuery.eq("category_slug", activeCategory);

    productQuery =
      sort === "price-low"
        ? productQuery.order("price_pkr", { ascending: true })
        : sort === "price-high"
          ? productQuery.order("price_pkr", { ascending: false })
          : productQuery.order("created_at", { ascending: false });

    const [catResp, productResp, newResp, bestResp] = await Promise.all([
      supabase.from("categories").select("*").order("display_order"),
      productQuery,
      // Always show New + Best Seller carousels (not affected by category filter)
      supabase
        .from("products")
        .select("*")
        .eq("is_published", true)
        .eq("is_new_arrival", true)
        .order("created_at", { ascending: false })
        .limit(8),
      supabase
        .from("products")
        .select("*")
        .eq("is_published", true)
        .eq("is_best_seller", true)
        .order("created_at", { ascending: false })
        .limit(8),
    ]);

    categories = (catResp.data ?? []) as Category[];
    products = (productResp.data ?? []) as Product[];
    newArrivals = (newResp.data ?? []) as Product[];
    bestSellers = (bestResp.data ?? []) as Product[];
  } catch (err) {
    dbError = (err as Error).message;
  }

  const activeCat = categories.find((c) => c.slug === activeCategory);

  return (
    <>
      <AnnouncementBar />
      <Header />
      <main className="flex flex-1 flex-col">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-b from-[var(--brand-soft)] via-[var(--surface-soft)] to-background">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-[var(--brand)]/15 blur-3xl"
          />
          <div className="relative mx-auto max-w-7xl px-4 py-14 text-center sm:px-6 lg:px-8 lg:py-20">
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--brand)]/30 bg-white/70 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-[var(--brand)] backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" />
              Shop the Collection
            </span>
            <h1 className="font-heading mt-5 text-4xl leading-[1.05] text-foreground sm:text-5xl lg:text-6xl">
              {activeCat ? activeCat.name : "Every Piece, Made by Hand"}
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
              {activeCat?.description ??
                "Browse our full collection of handmade crochet — bags, gajray, bouquets, and more, all stitched with love."}
            </p>
          </div>
        </section>

        {/* Category pills */}
        <section className="sticky top-16 z-20 border-b border-border bg-background/95 backdrop-blur lg:top-20">
          <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 py-3 scrollbar-hide sm:px-6 lg:px-8">
            <Pill href="/shop" active={!activeCategory} label="All" />
            {categories.map((c) => (
              <Pill
                key={c.slug}
                href={`/shop?category=${c.slug}`}
                active={activeCategory === c.slug}
                label={c.name}
              />
            ))}
          </div>
        </section>

        {dbError ? (
          <div className="mx-auto mt-10 max-w-3xl rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-800">
            <p className="font-semibold">Couldn&apos;t load the shop.</p>
            <p className="mt-1">{dbError}</p>
            <p className="mt-2 text-xs">
              Make sure your Supabase env vars are set and the schema in{" "}
              <code>supabase/schema.sql</code> has been run.
            </p>
          </div>
        ) : null}

        {/* New Arrivals strip — only on the All view */}
        {!activeCategory && newArrivals.length > 0 ? (
          <section className="bg-background py-14 sm:py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <SectionHeader
                eyebrow="Just Arrived"
                title="New Arrivals"
                href="/shop?sort=newest"
              />
              <div className="mt-8 grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
                {newArrivals.slice(0, 4).map((p) => (
                  <ShopProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {/* Best Sellers strip — only on the All view */}
        {!activeCategory && bestSellers.length > 0 ? (
          <section className="bg-[var(--surface-soft)] py-14 sm:py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <SectionHeader
                eyebrow="Customer Favorites"
                title="Best Sellers"
                icon={<Star className="h-3.5 w-3.5 fill-current" />}
              />
              <div className="mt-8 grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
                {bestSellers.slice(0, 4).map((p) => (
                  <ShopProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {/* Full grid */}
        <section className="bg-background py-14 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <SectionHeader
                eyebrow={activeCat ? activeCat.name : "All Products"}
                title={
                  activeCat
                    ? `${activeCat.name} (${products.length})`
                    : `Everything (${products.length})`
                }
              />
              <SortSelect current={sort} category={activeCategory} />
            </div>

            {products.length === 0 && !dbError ? (
              <div className="mt-10 rounded-3xl border border-dashed border-border bg-[var(--surface-soft)] p-10 text-center">
                <p className="font-heading text-lg text-foreground">
                  Nothing here yet
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {activeCat
                    ? `No products in ${activeCat.name} just yet — check back soon!`
                    : "Our shop is being stocked. Come back in a moment."}
                </p>
              </div>
            ) : (
              <div className="mt-8 grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
                {products.map((p) => (
                  <ShopProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function Pill({
  href,
  active,
  label,
}: {
  href: string;
  active: boolean;
  label: string;
}) {
  return (
    <Link
      href={href}
      className={`shrink-0 rounded-full border px-4 py-1.5 text-xs font-medium transition-all ${
        active
          ? "border-[var(--brand)] bg-[var(--brand)] text-white"
          : "border-border bg-background text-foreground/70 hover:border-[var(--brand)] hover:text-[var(--brand)]"
      }`}
    >
      {label}
    </Link>
  );
}

function SectionHeader({
  eyebrow,
  title,
  icon,
  href,
}: {
  eyebrow: string;
  title: string;
  icon?: React.ReactNode;
  href?: string;
}) {
  const heading = (
    <div>
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand)]">
        {icon}
        {eyebrow}
      </span>
      <h2 className="font-heading mt-2 text-2xl text-foreground sm:text-3xl">
        {title}
      </h2>
    </div>
  );
  if (href) {
    return (
      <Link href={href} className="group">
        {heading}
      </Link>
    );
  }
  return heading;
}

