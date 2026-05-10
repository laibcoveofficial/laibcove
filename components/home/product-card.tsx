import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag, Eye, Star } from "lucide-react";

export type Product = {
  id: string;
  name: string;
  href: string;
  image: string;
  price: number;
  oldPrice?: number;
  rating: number;
  reviews: number;
  badge?: "New" | "Best Seller" | "Sale" | "Limited";
};

const badgeStyles: Record<NonNullable<Product["badge"]>, string> = {
  New: "bg-[var(--brand)] text-white",
  "Best Seller": "bg-foreground text-white",
  Sale: "bg-rose-500 text-white",
  Limited: "bg-amber-500 text-white",
};

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl bg-card ring-1 ring-border/60 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-[var(--brand)]/15">
      <div className="relative aspect-square overflow-hidden bg-[var(--surface-soft)]">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />

        {product.badge && (
          <span
            className={`absolute top-3 left-3 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${badgeStyles[product.badge]}`}
          >
            {product.badge}
          </span>
        )}

        {/* Floating actions */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <button
            type="button"
            aria-label="Add to wishlist"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-foreground shadow-md transition-colors hover:bg-[var(--brand)] hover:text-white"
          >
            <Heart className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Quick view"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-foreground shadow-md transition-colors hover:bg-[var(--brand)] hover:text-white"
          >
            <Eye className="h-4 w-4" />
          </button>
        </div>

        {/* Add to cart slide-up */}
        <div className="absolute inset-x-3 bottom-3 translate-y-[120%] transition-transform duration-300 group-hover:translate-y-0">
          <button
            type="button"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--brand)] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[var(--brand)]/25 transition-colors hover:bg-[var(--brand)]/90"
          >
            <ShoppingBag className="h-4 w-4" />
            Add to Cart
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <div className="flex items-center gap-1 text-[var(--brand)]">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-3.5 w-3.5 ${i < Math.floor(product.rating) ? "fill-current" : "fill-muted text-muted-foreground/40"}`}
              strokeWidth={0}
            />
          ))}
          <span className="ml-1 text-xs text-muted-foreground">
            ({product.reviews})
          </span>
        </div>
        <Link
          href={product.href}
          className="line-clamp-1 text-[15px] font-medium text-foreground transition-colors hover:text-[var(--brand)]"
        >
          {product.name}
        </Link>
        <div className="mt-auto flex items-baseline gap-2 pt-1">
          <span className="font-heading text-lg font-semibold text-foreground">
            ${product.price.toFixed(2)}
          </span>
          {product.oldPrice && (
            <span className="text-sm text-muted-foreground line-through">
              ${product.oldPrice.toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
