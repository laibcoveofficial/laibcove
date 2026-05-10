import "server-only";
import { getSupabase } from "@/lib/supabase/server";
import type { Coupon } from "@/lib/supabase/types";

export type CouponResult =
  | {
      ok: true;
      code: string;
      discount: number;
      coupon: Pick<Coupon, "code" | "type" | "value" | "description">;
    }
  | { ok: false; error: string };

export async function validateCoupon(
  rawCode: string,
  subtotal: number,
): Promise<CouponResult> {
  const code = rawCode.trim().toUpperCase();
  if (!code) return { ok: false, error: "Enter a coupon code." };

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("coupons")
    .select("*")
    .ilike("code", code)
    .eq("is_active", true)
    .maybeSingle();

  if (error) return { ok: false, error: "Couldn't check that code." };
  if (!data) return { ok: false, error: "Invalid coupon code." };

  const coupon = data as Coupon;

  const now = Date.now();
  if (coupon.starts_at && new Date(coupon.starts_at).getTime() > now) {
    return { ok: false, error: "This coupon isn't active yet." };
  }
  if (coupon.expires_at && new Date(coupon.expires_at).getTime() < now) {
    return { ok: false, error: "This coupon has expired." };
  }
  if (
    coupon.usage_limit !== null &&
    coupon.times_used >= coupon.usage_limit
  ) {
    return { ok: false, error: "This coupon has reached its usage limit." };
  }
  if (subtotal < coupon.min_order_pkr) {
    return {
      ok: false,
      error: `Minimum order of PKR ${coupon.min_order_pkr.toLocaleString()} required for this coupon.`,
    };
  }

  let discount =
    coupon.type === "percent"
      ? Math.round((subtotal * coupon.value) / 100)
      : Math.round(coupon.value);

  if (coupon.max_discount_pkr && discount > coupon.max_discount_pkr) {
    discount = Math.round(coupon.max_discount_pkr);
  }
  // Never let discount exceed subtotal
  if (discount > subtotal) discount = subtotal;

  return {
    ok: true,
    code: coupon.code,
    discount,
    coupon: {
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      description: coupon.description,
    },
  };
}
