import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ImageOff } from "lucide-react";
import { getSupabase } from "@/lib/supabase/server";
import type { Category } from "@/lib/supabase/types";

const FALLBACK_IMAGES: Record<string, string> = {
  bags: "https://images.unsplash.com/photo-1591561954557-26941169b49e?w=600&h=750&fit=crop",
  gajre: "https://images.unsplash.com/photo-1590595906931-81f04f0ccebb?w=600&h=750&fit=crop",
  flowers: "https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=600&h=750&fit=crop",
  bouquets: "https://images.unsplash.com/photo-1582794541440-3497a927d659?w=600&h=750&fit=crop",
  clothing: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=600&h=750&fit=crop",
  "home-decor": "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600&h=750&fit=crop",
  baby: "https://images.unsplash.com/photo-1522771930-78848d9293e8?w=600&h=750&fit=crop",
  keychains: "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=600&h=750&fit=crop",
};

async function loadCategories() {
  try {
    const supabase = getSupabase();
    const [catsResp, productsResp] = await Promise.all([
      supabase
        .from("categories")
        .select("*")
        .order("display_order", { ascending: true }),
      supabase
        .from("products")
        .select("category_slug")
        .eq("is_published", true),
    ]);

    const counts = new Map<string, number>();
    for (const p of productsResp.data ?? []) {
      const slug = (p as { category_slug: string | null }).category_slug;
      if (!slug) continue;
      counts.set(slug, (counts.get(slug) ?? 0) + 1);
    }

    return {
      categories: (catsResp.data ?? []) as Category[],
      counts,
    };
  } catch {
    return { categories: [] as Category[], counts: new Map<string, number>() };
  }
}

export async function FeaturedCategories() {
  const { categories, counts } = await loadCategories();
  if (categories.length === 0) return null;

  return (
    <section className="bg-background py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-end justify-between gap-6 sm:flex-row sm:items-end">
          <div className="max-w-xl">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand)]">
              Browse Collections
            </span>
            <h2 className="font-heading mt-3 text-3xl text-foreground sm:text-4xl lg:text-5xl">
              Shop by Category
            </h2>
            <p className="mt-3 text-base text-muted-foreground">
              Explore our handmade crochet creations — each one designed and
              crafted with intention.
            </p>
          </div>
          <Link
            href="/shop"
            className="group inline-flex items-center gap-2 text-sm font-semibold text-[var(--brand)] hover:underline"
          >
            View All Categories
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
          {categories.map((cat) => {
            const count = counts.get(cat.slug) ?? 0;
            const image = cat.image_url || FALLBACK_IMAGES[cat.slug];

            return (
              <Link
                key={cat.id}
                href={`/shop?category=${cat.slug}`}
                className="group relative block overflow-hidden rounded-2xl bg-[var(--surface-soft)] shadow-sm ring-1 ring-border/60 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-[var(--brand)]/15"
              >
                <div className="relative aspect-[4/5] w-full overflow-hidden">
                  {image ? (
                    <Image
                      src={image}
                      alt={cat.name}
                      fill
                      sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-[var(--brand-soft)] text-[var(--brand)]">
                      <ImageOff className="h-8 w-8" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/0 to-transparent" />
                </div>
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-4 sm:p-5">
                  <div className="text-white">
                    <h3 className="font-heading text-lg font-medium sm:text-xl">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-white/80">
                      {count} {count === 1 ? "item" : "items"}
                    </p>
                  </div>
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[var(--brand)] opacity-0 transition-all duration-300 group-hover:opacity-100">
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
