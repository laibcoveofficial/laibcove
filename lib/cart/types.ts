import type { PriceTier } from "@/lib/supabase/types";

export type CartItem = {
  // Stable key for matching a line. For products with variants this includes
  // the variant name so the same product in two colors is two lines.
  lineKey: string;

  productId: string;
  slug: string | null;
  name: string;
  image: string | null;

  // Effective unit price for the CURRENT quantity. Recomputed by the cart
  // context whenever quantity changes, so reads are direct.
  unitPrice: number;

  quantity: number;
  maxStock: number;

  // Pricing inputs preserved so the cart can recompute unitPrice when qty
  // changes (without re-fetching the product).
  basePrice: number;
  priceTiers: PriceTier[] | null;

  // Selected color variation (optional).
  variantName: string | null;
  variantImage: string | null;
};

export type CartTotals = {
  itemCount: number;
  subtotal: number;
  delivery: number;
  discount: number;
  total: number;
};

export function buildLineKey(productId: string, variantName: string | null): string {
  return variantName ? `${productId}::${variantName}` : productId;
}
