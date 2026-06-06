"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getSupabase } from "@/lib/supabase/server";
import type { Coupon } from "@/lib/supabase/types";

export type CouponFormState = {
  status: "idle" | "error";
  message: string;
};

const text = (v: FormDataEntryValue | null) =>
  typeof v === "string" ? v.trim() : "";

// Optional non-negative number — empty string becomes null.
const optNum = (v: FormDataEntryValue | null): number | null => {
  const s = text(v);
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
};

// Required number with a fallback (e.g. min order defaults to 0).
const numOr = (v: FormDataEntryValue | null, fallback: number): number => {
  const n = optNum(v);
  return n === null ? fallback : n;
};

const bool = (v: FormDataEntryValue | null) =>
  v === "on" || v === "true" || v === "1";

// A <input type="datetime-local"> sends a wall-clock string like
// "2026-06-30T23:59" (no zone). Treat it as the browser's local time and store
// as an ISO timestamp; empty → null.
const toTimestamp = (v: FormDataEntryValue | null): string | null => {
  const s = text(v);
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
};

async function requireAdmin() {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
}

function revalidateCouponPaths() {
  revalidatePath("/admin/coupons");
}

// Read + validate the shared coupon fields out of the form. Returns either a
// validated row payload (sans id) or an error message to surface to the admin.
type CouponPayload = {
  code: string;
  description: string | null;
  type: Coupon["type"];
  value: number;
  min_order_pkr: number;
  max_discount_pkr: number | null;
  starts_at: string | null;
  expires_at: string | null;
  usage_limit: number | null;
  is_active: boolean;
};

function parseCouponForm(
  formData: FormData,
): { ok: true; data: CouponPayload } | { ok: false; message: string } {
  const code = text(formData.get("code")).toUpperCase();
  if (!code) return { ok: false, message: "Coupon code is required." };
  if (!/^[A-Z0-9_-]{2,40}$/.test(code)) {
    return {
      ok: false,
      message:
        "Code must be 2–40 characters: letters, numbers, dashes or underscores only.",
    };
  }

  const type = text(formData.get("type"));
  if (type !== "percent" && type !== "flat") {
    return { ok: false, message: "Choose a valid discount type." };
  }

  const value = optNum(formData.get("value"));
  if (value === null || value <= 0) {
    return { ok: false, message: "Discount value must be greater than zero." };
  }
  if (type === "percent" && value > 100) {
    return { ok: false, message: "A percentage discount can't exceed 100%." };
  }

  const minOrder = numOr(formData.get("min_order_pkr"), 0);
  if (minOrder < 0) {
    return { ok: false, message: "Minimum order amount can't be negative." };
  }

  const maxDiscount = optNum(formData.get("max_discount_pkr"));
  if (maxDiscount !== null && maxDiscount < 0) {
    return { ok: false, message: "Max discount can't be negative." };
  }

  const usageLimit = optNum(formData.get("usage_limit"));
  if (usageLimit !== null && (usageLimit < 1 || !Number.isInteger(usageLimit))) {
    return { ok: false, message: "Usage limit must be a whole number ≥ 1." };
  }

  const startsAt = toTimestamp(formData.get("starts_at"));
  const expiresAt = toTimestamp(formData.get("expires_at"));
  if (startsAt && expiresAt && new Date(startsAt) >= new Date(expiresAt)) {
    return { ok: false, message: "Expiry must be after the start date." };
  }

  return {
    ok: true,
    data: {
      code,
      description: text(formData.get("description")) || null,
      type,
      value,
      min_order_pkr: minOrder,
      max_discount_pkr: type === "percent" ? maxDiscount : null,
      starts_at: startsAt,
      expires_at: expiresAt,
      usage_limit: usageLimit,
      is_active: bool(formData.get("is_active")),
    },
  };
}

// Map a Postgres unique-violation on the code into a friendly message.
function friendlyError(message: string): string {
  if (/duplicate key/i.test(message) && /code/i.test(message)) {
    return "A coupon with that code already exists.";
  }
  return message;
}

export async function createCoupon(
  _prev: CouponFormState,
  formData: FormData,
): Promise<CouponFormState> {
  await requireAdmin();

  const parsed = parseCouponForm(formData);
  if (!parsed.ok) return { status: "error", message: parsed.message };

  const supabase = getSupabase();
  const { error } = await supabase.from("coupons").insert(parsed.data);

  if (error) return { status: "error", message: friendlyError(error.message) };

  revalidateCouponPaths();
  redirect(
    `/admin/coupons?saved=created&code=${encodeURIComponent(parsed.data.code)}`,
  );
}

export async function updateCoupon(
  _prev: CouponFormState,
  formData: FormData,
): Promise<CouponFormState> {
  await requireAdmin();

  const id = text(formData.get("id"));
  if (!id) return { status: "error", message: "Missing id." };

  const parsed = parseCouponForm(formData);
  if (!parsed.ok) return { status: "error", message: parsed.message };

  const supabase = getSupabase();
  const { error } = await supabase
    .from("coupons")
    .update(parsed.data)
    .eq("id", id);

  if (error) return { status: "error", message: friendlyError(error.message) };

  revalidateCouponPaths();
  redirect(
    `/admin/coupons?saved=updated&code=${encodeURIComponent(parsed.data.code)}`,
  );
}

export async function deleteCoupon(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = text(formData.get("id"));
  if (!id) throw new Error("Missing id");

  const supabase = getSupabase();
  const { error } = await supabase.from("coupons").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidateCouponPaths();
  redirect("/admin/coupons");
}

// Quick activate/deactivate from the list — flips is_active to the given value.
export async function setCouponActive(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = text(formData.get("id"));
  if (!id) throw new Error("Missing id");
  const active = bool(formData.get("active"));

  const supabase = getSupabase();
  const { error } = await supabase
    .from("coupons")
    .update({ is_active: active })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidateCouponPaths();
}
