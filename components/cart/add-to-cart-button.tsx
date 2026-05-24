"use client";

import { useState } from "react";
import { Check, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart/context";
import type { Product, ProductVariant } from "@/lib/supabase/types";
import { isProductSoldOut, variantStock } from "@/lib/supabase/types";

type Variant = "primary" | "secondary";

export function AddToCartButton({
  product,
  quantity = 1,
  selectedVariant,
  variant = "primary",
  className = "",
  label,
  disabled,
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
  quantity?: number;
  selectedVariant?: ProductVariant | null;
  variant?: Variant;
  className?: string;
  label?: string;
  disabled?: boolean;
}) {
  const { addItem, hydrated } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  const hasVariants = Array.isArray(product.variants) && product.variants.length > 0;
  const effectiveStock = variantStock(product.stock, selectedVariant);
  // Without variants the product is sold out when its stock counter hits 0.
  // With variants the selected variant's stock is what matters — but if no
  // variant is picked yet we fall back to whole-product availability.
  const soldOut = hasVariants
    ? selectedVariant
      ? effectiveStock <= 0 || product.status === "sold_out"
      : isProductSoldOut(product)
    : isProductSoldOut(product);

  const needsVariantPick = hasVariants && !selectedVariant;

  const onClick = () => {
    if (needsVariantPick) return;
    const basePrice = Number(product.price_pkr);
    const image =
      selectedVariant?.image_url ?? product.images?.[0] ?? null;
    addItem(
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        image,
        basePrice,
        priceTiers: product.price_tiers ?? null,
        maxStock: effectiveStock,
        variantName: selectedVariant?.name ?? null,
        variantImage: selectedVariant?.image_url ?? null,
      },
      quantity,
    );
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1400);
  };

  const base =
    "inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-60";
  const tone =
    variant === "primary"
      ? "bg-[var(--brand)] text-white shadow-lg shadow-[var(--brand)]/25 hover:-translate-y-0.5"
      : "border border-foreground/20 bg-white text-foreground hover:border-[var(--brand)] hover:text-[var(--brand)]";

  return (
    <button
      type="button"
      disabled={!hydrated || soldOut || disabled || needsVariantPick}
      onClick={onClick}
      aria-live="polite"
      className={`${base} ${tone} ${className}`}
    >
      {justAdded ? (
        <>
          <Check className="h-4 w-4" />
          Added to cart
        </>
      ) : (
        <>
          <ShoppingBag className="h-4 w-4" />
          {soldOut
            ? "Sold Out"
            : needsVariantPick
              ? "Select a color"
              : (label ?? "Add to Cart")}
        </>
      )}
    </button>
  );
}
