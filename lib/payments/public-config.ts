// Client-safe payment metadata. The actual account numbers are server-only
// (in lib/payments/config.ts) — these are just for rendering method picker UI.

import type { PaymentMethod } from "@/lib/supabase/types";

export type PaymentMethodMeta = {
  method: PaymentMethod;
  label: string;
  tagline: string;
  // Hex color used for the method's accent border / icon tint.
  color: string;
};

export const PAYMENT_METHOD_META: Record<PaymentMethod, PaymentMethodMeta> = {
  jazzcash: {
    method: "jazzcash",
    label: "JazzCash",
    tagline: "Send via your JazzCash app or wallet",
    color: "#ED1C24",
  },
  easypaisa: {
    method: "easypaisa",
    label: "EasyPaisa",
    tagline: "Send via your EasyPaisa app or wallet",
    color: "#1AB351",
  },
};
