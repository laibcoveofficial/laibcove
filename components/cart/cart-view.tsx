"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Plus,
  Minus,
  Trash2,
  ImageOff,
  ShoppingBag,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { useCart } from "@/lib/cart/context";
import { formatPKR } from "@/lib/supabase/types";

export function CartView() {
  const { items, hydrated, totals, updateQuantity, removeItem } = useCart();

  if (!hydrated) {
    return (
      <div className="rounded-3xl border border-border bg-background p-10 text-center text-muted-foreground">
        Loading your cart…
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-md rounded-3xl border border-dashed border-border bg-background p-10 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--brand-soft)] text-[var(--brand)]">
          <ShoppingBag className="h-7 w-7" />
        </div>
        <p className="font-heading mt-4 text-xl text-foreground">
          Your cart is empty
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Browse our latest crochet pieces — every stitch made with love.
        </p>
        <Link
          href="/shop"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-[var(--brand)] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[var(--brand)]/25 transition-all hover:-translate-y-0.5"
        >
          Browse the shop
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
      <section>
        <ul className="space-y-3">
          {items.map((item) => (
            <li
              key={item.lineKey}
              className="flex gap-4 rounded-3xl border border-border bg-background p-4"
            >
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-[var(--surface-soft)] sm:h-28 sm:w-28">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="112px"
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                    <ImageOff className="h-6 w-6" />
                  </div>
                )}
              </div>

              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <Link
                      href={item.slug ? `/shop/${item.slug}` : "/shop"}
                      className="font-heading text-base text-foreground hover:text-[var(--brand)] sm:text-lg"
                    >
                      {item.name}
                    </Link>
                    {item.variantName ? (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Color: <span className="font-medium text-foreground/80">{item.variantName}</span>
                      </p>
                    ) : null}
                  </div>
                  <span className="text-sm font-semibold text-foreground sm:text-base">
                    {formatPKR(item.unitPrice * item.quantity)}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatPKR(item.unitPrice)} each
                </span>

                <div className="mt-auto flex items-center justify-between gap-2 pt-3">
                  <div className="inline-flex items-center rounded-full border border-border">
                    <button
                      type="button"
                      aria-label="Decrease quantity"
                      onClick={() =>
                        updateQuantity(item.lineKey, item.quantity - 1)
                      }
                      className="inline-flex h-8 w-8 items-center justify-center rounded-l-full text-foreground/70 transition-colors hover:bg-[var(--surface-soft)]"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="min-w-[36px] text-center text-sm font-medium text-foreground">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      aria-label="Increase quantity"
                      disabled={
                        item.maxStock > 0 && item.quantity >= item.maxStock
                      }
                      onClick={() =>
                        updateQuantity(item.lineKey, item.quantity + 1)
                      }
                      className="inline-flex h-8 w-8 items-center justify-center rounded-r-full text-foreground/70 transition-colors hover:bg-[var(--surface-soft)] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.lineKey)}
                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-foreground/60 transition-colors hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-6">
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground/70 hover:text-[var(--brand)]"
          >
            <ArrowLeft className="h-4 w-4" />
            Continue shopping
          </Link>
        </div>
      </section>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-3xl border border-border bg-background p-6 shadow-sm">
          <h2 className="font-heading text-xl text-foreground">Order Summary</h2>
          <dl className="mt-5 space-y-2.5 text-sm">
            <div className="flex justify-between text-foreground/85">
              <dt>
                Subtotal{" "}
                <span className="text-xs text-muted-foreground">
                  ({totals.itemCount} item{totals.itemCount > 1 ? "s" : ""})
                </span>
              </dt>
              <dd className="font-medium">{formatPKR(totals.subtotal)}</dd>
            </div>
            <div className="flex justify-between text-foreground/85">
              <dt>Delivery</dt>
              <dd className="font-medium">
                {totals.delivery === 0 ? (
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                    Free
                  </span>
                ) : (
                  formatPKR(totals.delivery)
                )}
              </dd>
            </div>
            <div className="flex justify-between border-t border-border pt-3 text-base font-semibold text-foreground">
              <dt>Total</dt>
              <dd className="font-heading text-xl">{formatPKR(totals.total)}</dd>
            </div>
          </dl>

          <Link
            href="/checkout"
            className="group mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--brand)] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[var(--brand)]/25 transition-all hover:-translate-y-0.5"
          >
            Proceed to Checkout
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            🔒 Secure checkout · JazzCash & EasyPaisa accepted
          </p>
        </div>
      </aside>
    </div>
  );
}
