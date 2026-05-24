"use client";

import { useState } from "react";
import { Check, Plus } from "lucide-react";
import { useCart } from "@/lib/cart/context";
import { isProductSoldOut, type Product } from "@/lib/supabase/types";

export function QuickAddButton({
  product,
}: {
  product: Pick<
    Product,
    | "id"
    | "name"
    | "slug"
    | "price_pkr"
    | "images"
    | "stock"
    | "status"
    | "variants"
    | "price_tiers"
  >;
}) {
  const { addItem, hydrated } = useCart();
  const [justAdded, setJustAdded] = useState(false);
  const soldOut = isProductSoldOut(product);
  // Products with colour choices can't quick-add — buyer needs to pick a colour
  // on the detail page first.
  const hasVariants =
    Array.isArray(product.variants) && product.variants.length > 0;

  if (soldOut || hasVariants) return null;

  return (
    <button
      type="button"
      disabled={!hydrated}
      onClick={(e) => {
        // Prevent the wrapping <Link> from navigating
        e.preventDefault();
        e.stopPropagation();
        addItem(
          {
            productId: product.id,
            slug: product.slug,
            name: product.name,
            image: product.images?.[0] ?? null,
            basePrice: Number(product.price_pkr),
            priceTiers: product.price_tiers ?? null,
            maxStock: product.stock,
            variantName: null,
            variantImage: null,
          },
          1,
        );
        setJustAdded(true);
        setTimeout(() => setJustAdded(false), 1200);
      }}
      aria-label={`Add ${product.name} to cart`}
      className="absolute bottom-3 right-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-[var(--brand)] text-white opacity-0 shadow-lg shadow-[var(--brand)]/25 transition-all group-hover:opacity-100 hover:scale-110 disabled:opacity-40"
    >
      {justAdded ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
    </button>
  );
}
