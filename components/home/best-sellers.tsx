import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ShopProductCard } from "@/components/shop/product-card";
import { getSupabase } from "@/lib/supabase/server";
import type { Product } from "@/lib/supabase/types";

async function loadBestSellers(): Promise<Product[]> {
  try {
    const supabase = getSupabase();
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("is_published", true)
      .eq("is_best_seller", true)
      .order("created_at", { ascending: false })
      .limit(8);
    return (data ?? []) as Product[];
  } catch {
    return [];
  }
}

export async function BestSellers() {
  const products = await loadBestSellers();
  if (products.length === 0) return null;

  return (
    <section className="bg-[var(--surface-soft)] py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-end justify-between gap-6 sm:flex-row">
          <div className="max-w-xl">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand)]">
              Customer Favorites
            </span>
            <h2 className="font-heading mt-3 text-3xl text-foreground sm:text-4xl lg:text-5xl">
              Best Sellers
            </h2>
            <p className="mt-3 text-base text-muted-foreground">
              The pieces our customers can&apos;t stop talking about — loved,
              gifted, and reordered.
            </p>
          </div>
          <Link
            href="/shop"
            className="group inline-flex items-center gap-2 text-sm font-semibold text-[var(--brand)] hover:underline"
          >
            View All
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <ShopProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
