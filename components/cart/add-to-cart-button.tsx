"use client";

import { useState } from "react";
import { Check, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart/context";
import type { Product } from "@/lib/supabase/types";

type Variant = "primary" | "secondary";

export function AddToCartButton({
  product,
  quantity = 1,
  variant = "primary",
  className = "",
  label,
}: {
  product: Pick<Product, "id" | "name" | "slug" | "price_pkr" | "images" | "stock" | "status">;
  quantity?: number;
  variant?: Variant;
  className?: string;
  label?: string;
}) {
  const { addItem, hydrated } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  const soldOut = product.status === "sold_out" || product.stock <= 0;

  const onClick = () => {
    addItem(
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        image: product.images?.[0] ?? null,
        unitPrice: Number(product.price_pkr),
        maxStock: product.stock,
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
      disabled={!hydrated || soldOut}
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
          {soldOut ? "Sold Out" : (label ?? "Add to Cart")}
        </>
      )}
    </button>
  );
}
