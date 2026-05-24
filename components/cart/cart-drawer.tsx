"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  ImageOff,
  ArrowRight,
} from "lucide-react";
import { useCart } from "@/lib/cart/context";
import { formatPKR } from "@/lib/supabase/types";

export function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    updateQuantity,
    removeItem,
    totals,
  } = useCart();

  // Lock body scroll when open
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCart();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, closeCart]);

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden={!isOpen}
        onClick={closeCart}
        className={`fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen
            ? "opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      />

      {/* Panel */}
      <aside
        role="dialog"
        aria-label="Shopping cart"
        aria-modal="true"
        aria-hidden={!isOpen}
        className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-background shadow-2xl transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--brand-soft)] text-[var(--brand)]">
              <ShoppingBag className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-heading text-lg leading-none text-foreground">
                Your Cart
              </h2>
              <p className="text-xs text-muted-foreground">
                {totals.itemCount === 0
                  ? "Empty"
                  : `${totals.itemCount} item${totals.itemCount > 1 ? "s" : ""}`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeCart}
            aria-label="Close cart"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-foreground/70 transition-colors hover:bg-[var(--surface-soft)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Items / empty */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--brand-soft)] text-[var(--brand)]">
                <ShoppingBag className="h-7 w-7" />
              </div>
              <p className="font-heading mt-4 text-lg text-foreground">
                Your cart is empty
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Add a piece of crochet love to get started.
              </p>
              <Link
                href="/shop"
                onClick={closeCart}
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-[var(--brand)] px-5 py-2.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5"
              >
                Browse the shop
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <ul className="space-y-3">
              {items.map((item) => (
                <li
                  key={item.lineKey}
                  className="flex gap-3 rounded-2xl border border-border bg-background p-3"
                >
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-[var(--surface-soft)]">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="80px"
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                        <ImageOff className="h-5 w-5" />
                      </div>
                    )}
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <Link
                      href={item.slug ? `/shop/${item.slug}` : "/shop"}
                      onClick={closeCart}
                      className="line-clamp-2 text-sm font-semibold text-foreground hover:text-[var(--brand)]"
                    >
                      {item.name}
                    </Link>
                    {item.variantName ? (
                      <span className="mt-0.5 text-[11px] text-muted-foreground">
                        Color: <span className="font-medium text-foreground/80">{item.variantName}</span>
                      </span>
                    ) : null}
                    <span className="mt-1 text-sm text-foreground/85">
                      {formatPKR(item.unitPrice)}
                    </span>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <div className="inline-flex items-center rounded-full border border-border">
                        <button
                          type="button"
                          aria-label="Decrease quantity"
                          onClick={() =>
                            updateQuantity(item.lineKey, item.quantity - 1)
                          }
                          className="inline-flex h-7 w-7 items-center justify-center rounded-l-full text-foreground/70 transition-colors hover:bg-[var(--surface-soft)]"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="min-w-[28px] text-center text-sm font-medium text-foreground">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          aria-label="Increase quantity"
                          disabled={
                            item.maxStock > 0 &&
                            item.quantity >= item.maxStock
                          }
                          onClick={() =>
                            updateQuantity(item.lineKey, item.quantity + 1)
                          }
                          className="inline-flex h-7 w-7 items-center justify-center rounded-r-full text-foreground/70 transition-colors hover:bg-[var(--surface-soft)] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <button
                        type="button"
                        aria-label={`Remove ${item.name}`}
                        onClick={() => removeItem(item.lineKey)}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-full text-foreground/40 transition-colors hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer summary */}
        {items.length > 0 ? (
          <div className="border-t border-border bg-[var(--surface-soft)] px-5 py-4">
            <dl className="space-y-1.5 text-sm">
              <div className="flex justify-between text-foreground/85">
                <dt>Subtotal</dt>
                <dd className="font-medium">{formatPKR(totals.subtotal)}</dd>
              </div>
              <div className="flex justify-between text-foreground/85">
                <dt>Delivery</dt>
                <dd className="font-medium">
                  {totals.delivery === 0 ? "Free" : formatPKR(totals.delivery)}
                </dd>
              </div>
              <div className="flex justify-between border-t border-border pt-2 text-base font-semibold text-foreground">
                <dt>Total</dt>
                <dd>{formatPKR(totals.total)}</dd>
              </div>
            </dl>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <Link
                href="/cart"
                onClick={closeCart}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-border bg-background px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:border-[var(--brand)] hover:text-[var(--brand)]"
              >
                View cart
              </Link>
              <Link
                href="/checkout"
                onClick={closeCart}
                className="group inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[var(--brand)] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[var(--brand)]/25 transition-all hover:-translate-y-0.5"
              >
                Checkout
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        ) : null}
      </aside>
    </>
  );
}
