"use client";

import Image from "next/image";
import { ImageOff } from "lucide-react";
import type { CartItem } from "@/lib/cart/types";
import { formatPKR } from "@/lib/supabase/types";

export function OrderSummary({
  items,
  subtotal,
  delivery,
  discount,
  total,
  couponCode,
  freeDeliveryThreshold,
}: {
  items: CartItem[];
  subtotal: number;
  delivery: number;
  discount: number;
  total: number;
  couponCode?: string | null;
  freeDeliveryThreshold?: number;
}) {
  const remainingForFree =
    freeDeliveryThreshold && delivery > 0 && subtotal < freeDeliveryThreshold
      ? freeDeliveryThreshold - subtotal
      : 0;

  return (
    <div className="rounded-3xl border border-border bg-background p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-xl text-foreground">Order Summary</h2>
        <span className="text-xs text-muted-foreground">
          {items.length} item{items.length === 1 ? "" : "s"}
        </span>
      </div>

      <ul className="mt-5 space-y-3 divide-y divide-border">
        {items.map((item, i) => (
          <li
            key={item.productId}
            className={`flex gap-3 ${i === 0 ? "" : "pt-3"}`}
          >
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[var(--surface-soft)]">
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="64px"
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                  <ImageOff className="h-5 w-5" />
                </div>
              )}
              <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-foreground px-1 text-[10px] font-semibold text-white">
                {item.quantity}
              </span>
            </div>
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="line-clamp-2 text-sm font-medium text-foreground">
                {item.name}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatPKR(item.unitPrice)} each
              </span>
            </div>
            <span className="shrink-0 self-start text-sm font-semibold text-foreground">
              {formatPKR(item.unitPrice * item.quantity)}
            </span>
          </li>
        ))}
      </ul>

      {remainingForFree > 0 ? (
        <div className="mt-5 rounded-2xl bg-[var(--brand-soft)] px-4 py-3 text-xs text-[var(--brand)]">
          You're <strong>{formatPKR(remainingForFree)}</strong> away from free
          delivery!
        </div>
      ) : null}

      <dl className="mt-5 space-y-2.5 text-sm">
        <div className="flex justify-between text-foreground/85">
          <dt>Subtotal</dt>
          <dd className="font-medium">{formatPKR(subtotal)}</dd>
        </div>
        <div className="flex justify-between text-foreground/85">
          <dt>Delivery</dt>
          <dd className="font-medium">
            {delivery === 0 ? (
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                Free
              </span>
            ) : (
              formatPKR(delivery)
            )}
          </dd>
        </div>
        {discount > 0 ? (
          <div className="flex justify-between text-emerald-700">
            <dt>
              Discount
              {couponCode ? (
                <span className="ml-1 text-xs text-muted-foreground">
                  ({couponCode})
                </span>
              ) : null}
            </dt>
            <dd className="font-medium">−{formatPKR(discount)}</dd>
          </div>
        ) : null}
        <div className="flex justify-between border-t border-border pt-3 text-base font-semibold text-foreground">
          <dt>Total</dt>
          <dd className="font-heading text-xl">{formatPKR(total)}</dd>
        </div>
      </dl>
    </div>
  );
}
