"use client";

import { ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart/context";

export function CartIconButton() {
  const { totals, openCart, hydrated } = useCart();
  const count = hydrated ? totals.itemCount : 0;

  return (
    <button
      type="button"
      aria-label={count > 0 ? `Cart, ${count} item${count > 1 ? "s" : ""}` : "Cart"}
      onClick={openCart}
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground/80 transition-colors hover:bg-[var(--brand-soft)] hover:text-[var(--brand)]"
    >
      <ShoppingBag className="h-[18px] w-[18px]" />
      {count > 0 ? (
        <span className="absolute -top-0.5 -right-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--brand)] px-1 text-[10px] font-semibold leading-none text-white">
          {count > 99 ? "99+" : count}
        </span>
      ) : null}
    </button>
  );
}
