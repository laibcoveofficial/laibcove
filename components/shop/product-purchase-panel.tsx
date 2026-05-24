"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Minus, Plus, Sparkles, Star } from "lucide-react";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { ProductImageGallery } from "@/components/shop/product-image-gallery";
import {
  formatPKR,
  isProductSoldOut,
  unitPriceForQuantity,
  variantStock,
  type Product,
  type ProductVariant,
} from "@/lib/supabase/types";

type Props = {
  product: Product;
};

// Combined product gallery + purchase controls. Holding both in one client
// component lets the colour swatch swap the gallery image and the qty
// selector update the displayed unit price (tier-aware) in lock-step.
export function ProductPurchasePanel({ product }: Props) {
  const variants = product.variants ?? [];
  const hasVariants = variants.length > 0;
  const tiers = product.price_tiers ?? null;
  const hasTiers = !!tiers && tiers.length > 0;

  // Start with no variant chosen so the main product image is shown on first
  // load. The buyer picks a colour explicitly, which then swaps the gallery
  // image and unlocks Add-to-Cart.
  const [selectedVariant, setSelectedVariant] =
    useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);

  const effectiveStock = variantStock(product.stock, selectedVariant);
  // Whole-product "Sold Out" badge follows the same rule as the card.
  // The Add-to-Cart button additionally disables when the *selected* variant
  // is the one that's out of stock (other variants may still be available).
  const productSoldOut = isProductSoldOut(product);
  const soldOut = productSoldOut || (hasVariants && effectiveStock <= 0);

  const onSale =
    product.compare_at_price_pkr !== null &&
    product.compare_at_price_pkr !== undefined &&
    product.compare_at_price_pkr > product.price_pkr;

  const unitPrice = useMemo(
    () => unitPriceForQuantity(Number(product.price_pkr), tiers, quantity),
    [product.price_pkr, tiers, quantity],
  );

  const lineTotal = unitPrice * quantity;

  const maxQty = Math.max(1, Math.min(99, effectiveStock || 99));
  const incQty = () => setQuantity((q) => Math.min(q + 1, maxQty));
  const decQty = () => setQuantity((q) => Math.max(q - 1, 1));

  // While no variant is chosen, leave the gallery on its own first image (the
  // product's main cover). When a variant is picked, swap to its image — or
  // fall back to the main cover if the variant has none.
  const forcedImage = selectedVariant
    ? (selectedVariant.image_url ?? product.images?.[0] ?? null)
    : null;

  // Sorted tiers for the breakdown table
  const sortedTiers = useMemo(
    () => (tiers ? [...tiers].sort((a, b) => a.min_qty - b.min_qty) : []),
    [tiers],
  );

  return (
    <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
      <div className="space-y-3">
        <div className="relative">
          <ProductImageGallery
            images={product.images || []}
            name={product.name}
            forcedImage={forcedImage}
          />
          <div className="absolute left-4 top-4 z-10 flex flex-col gap-1.5 pointer-events-none">
            {product.is_new_arrival ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-[var(--brand)] px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white">
                <Sparkles className="h-3 w-3" />
                New
              </span>
            ) : null}
            {product.is_best_seller ? (
              <span className="rounded-full bg-amber-400 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white">
                Best Seller
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="lg:sticky lg:top-24 lg:self-start">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {product.category_slug ? (
            <span className="rounded-full bg-[var(--brand-soft)] px-3 py-1 font-semibold uppercase tracking-wider text-[var(--brand)]">
              {product.category_slug}
            </span>
          ) : null}
          {soldOut ? (
            <span className="rounded-full bg-gray-100 px-3 py-1 font-semibold uppercase tracking-wider text-gray-700">
              Sold Out
            </span>
          ) : null}
        </div>

        <h1 className="font-heading mt-4 text-3xl text-foreground sm:text-4xl lg:text-5xl">
          {product.name}
        </h1>

        <div className="mt-5 flex items-baseline gap-3">
          <span className="font-heading text-3xl text-foreground">
            {formatPKR(unitPrice)}
          </span>
          {onSale ? (
            <span className="text-lg text-muted-foreground line-through">
              {formatPKR(product.compare_at_price_pkr)}
            </span>
          ) : null}
          {onSale ? (
            <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-700">
              Sale
            </span>
          ) : null}
          {hasTiers && unitPrice < Number(product.price_pkr) ? (
            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
              Bulk price
            </span>
          ) : null}
        </div>

        <div className="mt-6 flex items-center gap-1 text-[var(--brand)]">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="h-4 w-4 fill-current" strokeWidth={0} />
          ))}
          <span className="ml-1 text-sm text-muted-foreground">
            Handmade with love
          </span>
        </div>

        {hasVariants ? (
          <div className="mt-7">
            <p className="text-sm font-medium text-foreground">
              Color:{" "}
              <span className="text-foreground/70">
                {selectedVariant?.name ?? "Choose a color"}
              </span>
            </p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {variants.map((v) => {
                const isSelected = selectedVariant?.name === v.name;
                const vStock = variantStock(product.stock, v);
                const disabled = vStock <= 0;
                return (
                  <li key={v.name}>
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => {
                        setSelectedVariant(v);
                        // Reset qty if new variant has tighter stock
                        const newMax = Math.max(1, Math.min(99, vStock || 99));
                        setQuantity((q) => Math.min(q, newMax));
                      }}
                      aria-pressed={isSelected}
                      title={disabled ? `${v.name} (out of stock)` : v.name}
                      className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                        isSelected
                          ? "border-[var(--brand)] bg-[var(--brand-soft)] text-[var(--brand)]"
                          : "border-border bg-white text-foreground hover:border-[var(--brand)]"
                      } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
                    >
                      <span
                        className="h-4 w-4 rounded-full border border-black/10"
                        style={{ backgroundColor: v.color_hex ?? "#cccccc" }}
                        aria-hidden
                      />
                      {v.name}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}

        {hasTiers ? (
          <div className="mt-6 rounded-2xl border border-border bg-[var(--surface-soft)] px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand)]">
              Buy more, save more
            </p>
            <ul className="mt-2 space-y-1 text-sm text-foreground/85">
              <li className="flex items-center justify-between">
                <span>1 item</span>
                <span className="font-medium">{formatPKR(product.price_pkr)} each</span>
              </li>
              {sortedTiers.map((t) => (
                <li
                  key={t.min_qty}
                  className="flex items-center justify-between"
                >
                  <span>{t.min_qty} items</span>
                  <span className="font-medium">
                    {formatPKR(t.price_pkr)} each
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {/* Quantity selector */}
        {!soldOut ? (
          <div className="mt-6 flex items-center gap-4">
            <span className="text-sm font-medium text-foreground">Quantity</span>
            <div className="inline-flex items-center rounded-full border border-border">
              <button
                type="button"
                aria-label="Decrease quantity"
                onClick={decQty}
                disabled={quantity <= 1}
                className="inline-flex h-9 w-9 items-center justify-center rounded-l-full text-foreground/70 transition-colors hover:bg-[var(--surface-soft)] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="min-w-[40px] text-center text-sm font-medium text-foreground">
                {quantity}
              </span>
              <button
                type="button"
                aria-label="Increase quantity"
                onClick={incQty}
                disabled={quantity >= maxQty}
                className="inline-flex h-9 w-9 items-center justify-center rounded-r-full text-foreground/70 transition-colors hover:bg-[var(--surface-soft)] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
            {quantity > 1 ? (
              <span className="text-xs text-muted-foreground">
                Line total{" "}
                <span className="font-medium text-foreground/80">
                  {formatPKR(lineTotal)}
                </span>
              </span>
            ) : null}
          </div>
        ) : null}

        {product.description ? (
          <div className="mt-7 whitespace-pre-wrap text-base leading-relaxed text-foreground/85">
            {product.description}
          </div>
        ) : null}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          {soldOut ? (
            <Link
              href={`/contact?product=${encodeURIComponent(product.name)}`}
              className="group inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[var(--brand)] px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[var(--brand)]/25 transition-all hover:-translate-y-0.5"
            >
              Request Similar
            </Link>
          ) : (
            <AddToCartButton
              product={product}
              quantity={quantity}
              selectedVariant={selectedVariant}
              label="Add to Cart"
              className="flex-1"
            />
          )}
          <Link
            href="/shop"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-foreground/20 bg-white px-7 py-3.5 text-sm font-semibold text-foreground transition-colors hover:border-[var(--brand)] hover:text-[var(--brand)]"
          >
            Keep Browsing
          </Link>
        </div>

        <p className="mt-6 text-xs text-muted-foreground">
          Free delivery on orders over PKR 5,000. Each piece is made with love
          — turnaround is typically 7–10 working days once your payment is
          confirmed.
        </p>
      </div>
    </div>
  );
}
