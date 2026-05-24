import Image from "next/image";
import Link from "next/link";
import { Heart, ImageOff, Sparkles } from "lucide-react";
import { formatPKR, isProductSoldOut, type Product } from "@/lib/supabase/types";
import { QuickAddButton } from "@/components/shop/quick-add-button";

export function ShopProductCard({ product }: { product: Product }) {
  const cover = product.images?.[0];
  const second = product.images?.[1];
  const onSale =
    product.compare_at_price_pkr &&
    product.compare_at_price_pkr > product.price_pkr;
  const soldOut = isProductSoldOut(product);
  const variants = Array.isArray(product.variants) ? product.variants : [];

  return (
    <Link
      href={`/shop/${product.slug || product.id}`}
      className="group relative flex flex-col overflow-hidden rounded-3xl border border-border bg-background transition-all hover:-translate-y-1 hover:border-[var(--brand)]/30 hover:shadow-xl hover:shadow-[var(--brand)]/10"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-[var(--surface-soft)]">
        {cover ? (
          <Image
            src={cover}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            unoptimized
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <ImageOff className="h-8 w-8" />
          </div>
        )}
        {second ? (
          <Image
            src={second}
            alt=""
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            unoptimized
          />
        ) : null}

        <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {product.is_new_arrival ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-[var(--brand)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
              <Sparkles className="h-3 w-3" />
              New
            </span>
          ) : null}
          {product.is_best_seller ? (
            <span className="rounded-full bg-amber-400 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
              Best Seller
            </span>
          ) : null}
          {onSale ? (
            <span className="rounded-full bg-red-500 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
              Sale
            </span>
          ) : null}
        </div>

        {soldOut ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-[2px]">
            <span className="rounded-full bg-foreground/90 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-white">
              Sold Out
            </span>
          </div>
        ) : null}

        <button
          type="button"
          aria-label="Save to wishlist"
          className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-foreground/70 opacity-0 shadow-sm transition-all group-hover:opacity-100 hover:text-[var(--brand)]"
        >
          <Heart className="h-4 w-4" />
        </button>

        <QuickAddButton product={product} />
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-heading text-lg leading-snug text-foreground line-clamp-2">
          {product.name}
        </h3>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="font-semibold text-foreground">
            {formatPKR(product.price_pkr)}
          </span>
          {onSale ? (
            <span className="text-sm text-muted-foreground line-through">
              {formatPKR(product.compare_at_price_pkr)}
            </span>
          ) : null}
        </div>
        {variants.length > 0 ? (
          <div className="mt-3 flex items-center gap-1.5">
            <ul className="flex items-center -space-x-1">
              {variants.slice(0, 5).map((v) => (
                <li
                  key={v.name}
                  title={v.name}
                  className="h-4 w-4 rounded-full border-2 border-white shadow-sm ring-1 ring-black/10"
                  style={{ backgroundColor: v.color_hex ?? "#cccccc" }}
                />
              ))}
            </ul>
            <span className="text-[11px] text-muted-foreground">
              {variants.length} color{variants.length > 1 ? "s" : ""}
            </span>
          </div>
        ) : null}
      </div>
    </Link>
  );
}
