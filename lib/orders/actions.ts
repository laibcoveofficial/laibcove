"use server";

import { headers } from "next/headers";
import { getSupabase } from "@/lib/supabase/server";
import { generateOrderNumber } from "@/lib/orders/order-id";
import { calcDelivery } from "@/lib/orders/delivery";
import { validateCheckout } from "@/lib/validation/checkout";
import { validateCoupon } from "@/lib/coupons/validate";
import {
  sendOrderReceivedEmails,
} from "@/lib/emails/order-mailer";
import {
  unitPriceForQuantity,
  variantStock,
  type Product,
  type ProductVariant,
} from "@/lib/supabase/types";

export type PlaceOrderResult =
  | { ok: true; orderNumber: string; total: number }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

// Naive in-memory dedupe to prevent accidental double submits within ~10s of
// each other from the same form. Keyed by IP + payment_reference + total.
// Survives only the lifetime of this serverless instance — for hard guarantees
// we'd add a unique constraint or rate-limit table.
const recentSubmits = new Map<string, number>();
const DEDUPE_WINDOW_MS = 10_000;

function dedupeKey(parts: string[]): string {
  return parts.filter(Boolean).join("::");
}

export async function placeOrder(
  payload: unknown,
): Promise<PlaceOrderResult> {
  const v = validateCheckout(payload);
  if (!v.ok || !v.data) {
    const first = Object.values(v.errors ?? {})[0] ?? "Invalid request.";
    return {
      ok: false,
      error: first,
      fieldErrors: v.errors as Record<string, string>,
    };
  }
  const data = v.data;

  // Server-side cart validation: re-fetch products by ID, snapshot prices/names
  const supabase = getSupabase();
  const productIds = data.items.map((i) => i.productId);
  const { data: productsData, error: productsErr } = await supabase
    .from("products")
    .select(
      "id, name, slug, price_pkr, images, stock, status, is_published, variants, price_tiers",
    )
    .in("id", productIds);

  if (productsErr) {
    return { ok: false, error: "Could not validate cart. Try again." };
  }

  const products = (productsData ?? []) as Pick<
    Product,
    | "id"
    | "name"
    | "slug"
    | "price_pkr"
    | "images"
    | "stock"
    | "status"
    | "is_published"
    | "variants"
    | "price_tiers"
  >[];
  const byId = new Map(products.map((p) => [p.id, p]));

  // Resolve which variant (if any) was selected for each line item, and compute
  // the tier-based unit price. Reject if missing/unpublished/oversold/invalid variant.
  type ResolvedItem = {
    productId: string;
    productName: string;
    productSlug: string | null;
    productImage: string | null;
    quantity: number;
    unitPrice: number;
    variant: ProductVariant | null;
  };
  const resolved: ResolvedItem[] = [];

  for (const item of data.items) {
    const p = byId.get(item.productId);
    if (!p || !p.is_published) {
      return {
        ok: false,
        error: `One of your items is no longer available. Please remove it and try again.`,
      };
    }
    if (p.status === "sold_out") {
      return {
        ok: false,
        error: `"${p.name}" is sold out. Please remove it from your cart.`,
      };
    }

    let variant: ProductVariant | null = null;
    const hasVariants = Array.isArray(p.variants) && p.variants.length > 0;
    if (hasVariants) {
      if (!item.variantName) {
        return {
          ok: false,
          error: `Please choose a colour for "${p.name}".`,
        };
      }
      variant =
        (p.variants ?? []).find((v) => v.name === item.variantName) ?? null;
      if (!variant) {
        return {
          ok: false,
          error: `Selected colour for "${p.name}" is no longer available.`,
        };
      }
    }

    const stockAvail = variantStock(p.stock, variant);
    if (stockAvail <= 0) {
      return {
        ok: false,
        error: `"${p.name}"${variant ? ` (${variant.name})` : ""} is sold out.`,
      };
    }
    if (item.quantity > stockAvail) {
      return {
        ok: false,
        error: `Only ${stockAvail} of "${p.name}"${variant ? ` (${variant.name})` : ""} available.`,
      };
    }

    const unitPrice = unitPriceForQuantity(
      Number(p.price_pkr),
      p.price_tiers,
      item.quantity,
    );

    resolved.push({
      productId: p.id,
      productName: p.name,
      productSlug: p.slug,
      productImage: variant?.image_url ?? p.images?.[0] ?? null,
      quantity: item.quantity,
      unitPrice,
      variant,
    });
  }

  // Server-authoritative totals
  const subtotal = resolved.reduce(
    (sum, r) => sum + r.unitPrice * r.quantity,
    0,
  );

  let discount = 0;
  let couponCode: string | null = null;
  if (data.coupon_code) {
    const couponResult = await validateCoupon(data.coupon_code, subtotal);
    if (!couponResult.ok) {
      return { ok: false, error: couponResult.error };
    }
    discount = couponResult.discount;
    couponCode = couponResult.code;
  }

  const delivery = calcDelivery(subtotal);
  const total = Math.max(0, subtotal + delivery - discount);

  // Dedupe check
  const hdrs = await headers();
  const ip =
    hdrs.get("x-forwarded-for")?.split(",")[0].trim() ||
    hdrs.get("x-real-ip") ||
    "unknown";
  const dKey = dedupeKey([
    ip,
    data.email,
    data.payment_method,
    data.payment_reference || "",
    String(total),
  ]);
  const now = Date.now();
  const last = recentSubmits.get(dKey);
  if (last && now - last < DEDUPE_WINDOW_MS) {
    return {
      ok: false,
      error: "We just received your order — please give it a moment.",
    };
  }
  recentSubmits.set(dKey, now);
  // Best-effort cleanup
  if (recentSubmits.size > 200) {
    for (const [k, t] of recentSubmits) {
      if (now - t > DEDUPE_WINDOW_MS) recentSubmits.delete(k);
    }
  }

  // Upsert customer (dedupe by lower(email))
  const { data: existingCustomer } = await supabase
    .from("customers")
    .select("id, total_orders, total_spent_pkr")
    .ilike("email", data.email)
    .maybeSingle();

  let customerId: string | null = existingCustomer?.id ?? null;
  if (!customerId) {
    const { data: newCustomer, error: custErr } = await supabase
      .from("customers")
      .insert({
        full_name: data.full_name,
        email: data.email,
        phone: data.phone,
      })
      .select("id")
      .single();
    if (custErr || !newCustomer) {
      return { ok: false, error: "Could not save your details. Try again." };
    }
    customerId = newCustomer.id;
  }

  // Generate unique order number — retry once on collision
  let orderNumber = generateOrderNumber();
  let orderId: string | null = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    const { data: orderRow, error: orderErr } = await supabase
      .from("orders")
      .insert({
        order_number: orderNumber,
        customer_id: customerId,
        customer_name: data.full_name,
        customer_email: data.email,
        customer_phone: data.phone,
        shipping_address: data.shipping_address,
        city: data.city,
        postal_code: data.postal_code ?? null,
        order_notes: data.order_notes ?? null,
        subtotal_pkr: subtotal,
        delivery_pkr: delivery,
        discount_pkr: discount,
        total_pkr: total,
        coupon_code: couponCode,
        payment_method: data.payment_method,
        payment_status: "pending",
        payment_reference: data.payment_reference ?? null,
        order_status: "pending",
      })
      .select("id, order_number")
      .single();

    if (!orderErr && orderRow) {
      orderId = orderRow.id;
      orderNumber = orderRow.order_number;
      break;
    }
    if (
      orderErr &&
      /duplicate key value/.test(orderErr.message) &&
      /order_number/.test(orderErr.message)
    ) {
      orderNumber = generateOrderNumber();
      continue;
    }
    return { ok: false, error: "Could not place order. Please try again." };
  }
  if (!orderId) {
    return { ok: false, error: "Could not place order. Please try again." };
  }

  // Insert items
  const itemRows = resolved.map((r) => ({
    order_id: orderId!,
    product_id: r.productId,
    product_name: r.productName,
    product_slug: r.productSlug,
    product_image: r.productImage,
    unit_price_pkr: r.unitPrice,
    quantity: r.quantity,
    line_total_pkr: r.unitPrice * r.quantity,
    variant_name: r.variant?.name ?? null,
  }));
  const { error: itemsErr } = await supabase
    .from("order_items")
    .insert(itemRows);
  if (itemsErr) {
    // Best-effort rollback (Supabase JS doesn't expose transactions; the
    // cascade FK on order_items means deleting the order will clean items).
    await supabase.from("orders").delete().eq("id", orderId);
    return { ok: false, error: "Could not save order items. Please try again." };
  }

  // Insert pending payment record (audit trail)
  await supabase.from("payments").insert({
    order_id: orderId,
    method: data.payment_method,
    status: "pending",
    amount_pkr: total,
    reference: data.payment_reference ?? null,
  });

  // Bump coupon usage (best-effort, non-blocking)
  if (couponCode) {
    const { data: c } = await supabase
      .from("coupons")
      .select("times_used")
      .eq("code", couponCode)
      .maybeSingle();
    if (c) {
      await supabase
        .from("coupons")
        .update({ times_used: (c.times_used ?? 0) + 1 })
        .eq("code", couponCode);
    }
  }

  // Send confirmation emails (don't block order success on email failure)
  try {
    await sendOrderReceivedEmails({
      orderNumber,
      customerName: data.full_name,
      customerEmail: data.email,
      customerPhone: data.phone,
      shippingAddress: data.shipping_address,
      city: data.city,
      paymentMethod: data.payment_method,
      paymentReference: data.payment_reference ?? null,
      items: resolved.map((r) => ({
        name: r.productName,
        quantity: r.quantity,
        unitPrice: r.unitPrice,
        lineTotal: r.unitPrice * r.quantity,
        image: r.productImage,
        variantName: r.variant?.name ?? null,
      })),
      subtotal,
      delivery,
      discount,
      total,
      couponCode,
    });
  } catch (err) {
    console.error("[order email] failed:", err);
  }

  return { ok: true, orderNumber, total };
}

// Validate a coupon from the client without placing an order.
export async function checkCoupon(code: string, subtotal: number) {
  if (typeof code !== "string" || typeof subtotal !== "number") {
    return { ok: false as const, error: "Invalid input." };
  }
  return validateCoupon(code, subtotal);
}
