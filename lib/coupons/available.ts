import "server-only";
import { getSupabase } from "@/lib/supabase/server";
import type { Coupon } from "@/lib/supabase/types";

// Public-safe shape shown to customers on the checkout page. Deliberately omits
// internal fields (id, times_used, usage_limit, dates) — only what's needed to
// present and apply the offer.
export type AvailableCoupon = {
  code: string;
  description: string | null;
  type: Coupon["type"];
  value: number;
  min_order_pkr: number;
  max_discount_pkr: number | null;
};

// Coupons a shopper can pick from at checkout: active, already started, not yet
// expired, and not used up. The real discount is still computed server-side by
// validateCoupon when applied/ordered — this only decides what to display.
export async function listAvailableCoupons(): Promise<AvailableCoupon[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("coupons")
    .select(
      "code, description, type, value, min_order_pkr, max_discount_pkr, starts_at, expires_at, usage_limit, times_used",
    )
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  const now = Date.now();
  return (data as Coupon[])
    .filter((c) => {
      if (c.starts_at && new Date(c.starts_at).getTime() > now) return false;
      if (c.expires_at && new Date(c.expires_at).getTime() < now) return false;
      if (c.usage_limit !== null && c.times_used >= c.usage_limit) return false;
      return true;
    })
    .map((c) => ({
      code: c.code,
      description: c.description,
      type: c.type,
      value: c.value,
      min_order_pkr: c.min_order_pkr,
      max_discount_pkr: c.max_discount_pkr,
    }));
}
