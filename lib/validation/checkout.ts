// Lightweight validators — keeps the bundle small (no zod runtime cost on client).

// Trim + collapse internal whitespace runs. Preserves printable chars.
const sanitize = (s: string) => s.replace(/\s+/g, " ").trim();

const PHONE_RE = /^[+0-9 ()\-]{7,20}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type CheckoutInput = {
  full_name: string;
  email: string;
  phone: string;
  shipping_address: string;
  city: string;
  postal_code?: string;
  order_notes?: string;
  payment_method: "jazzcash" | "easypaisa";
  payment_reference: string;
  coupon_code?: string;
  items: Array<{ productId: string; quantity: number }>;
};

export type CheckoutErrors = Partial<
  Record<keyof CheckoutInput | "items_invalid", string>
>;

export function validateCheckout(raw: unknown): {
  ok: boolean;
  data?: CheckoutInput;
  errors?: CheckoutErrors;
} {
  const errors: CheckoutErrors = {};
  if (!raw || typeof raw !== "object") {
    return { ok: false, errors: { items_invalid: "Invalid request body." } };
  }
  const r = raw as Record<string, unknown>;

  const full_name = sanitize(String(r.full_name ?? ""));
  if (full_name.length < 2 || full_name.length > 100) {
    errors.full_name = "Please enter your full name.";
  }

  const email = sanitize(String(r.email ?? "")).toLowerCase();
  if (!EMAIL_RE.test(email)) {
    errors.email = "Please enter a valid email address.";
  }

  const phone = sanitize(String(r.phone ?? ""));
  if (!PHONE_RE.test(phone)) {
    errors.phone = "Please enter a valid phone number.";
  }

  const shipping_address = sanitize(String(r.shipping_address ?? ""));
  if (shipping_address.length < 5 || shipping_address.length > 500) {
    errors.shipping_address = "Please enter a complete shipping address.";
  }

  const city = sanitize(String(r.city ?? ""));
  if (city.length < 2 || city.length > 80) {
    errors.city = "Please enter your city.";
  }

  const postal_code = sanitize(String(r.postal_code ?? ""));
  const order_notes = sanitize(String(r.order_notes ?? ""));
  if (order_notes.length > 1000) {
    errors.order_notes = "Notes are too long (max 1000 chars).";
  }

  const payment_method = String(r.payment_method ?? "");
  if (payment_method !== "jazzcash" && payment_method !== "easypaisa") {
    errors.payment_method = "Please choose a payment method.";
  }

  const payment_reference = sanitize(String(r.payment_reference ?? ""));
  if (!payment_reference) {
    errors.payment_reference = "Transaction ID is required.";
  } else if (payment_reference.length > 100) {
    errors.payment_reference = "Transaction ID is too long.";
  }

  const coupon_code = sanitize(String(r.coupon_code ?? "")).toUpperCase();

  const itemsRaw = r.items;
  const items: CheckoutInput["items"] = [];
  if (!Array.isArray(itemsRaw) || itemsRaw.length === 0) {
    errors.items_invalid = "Your cart is empty.";
  } else {
    for (const it of itemsRaw) {
      if (!it || typeof it !== "object") {
        errors.items_invalid = "Cart contains invalid items.";
        break;
      }
      const o = it as Record<string, unknown>;
      const productId = String(o.productId ?? "");
      const quantity = Math.floor(Number(o.quantity ?? 0));
      if (!productId || quantity < 1 || quantity > 99) {
        errors.items_invalid = "Cart contains invalid items.";
        break;
      }
      items.push({ productId, quantity });
    }
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    data: {
      full_name,
      email,
      phone,
      shipping_address,
      city,
      postal_code: postal_code || undefined,
      order_notes: order_notes || undefined,
      payment_method: payment_method as "jazzcash" | "easypaisa",
      payment_reference,
      coupon_code: coupon_code || undefined,
      items,
    },
  };
}
