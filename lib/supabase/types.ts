export type Lead = {
  id: string;
  created_at: string;
  full_name: string;
  email: string;
  phone: string;
  location: string | null;
  product_types: string | null;
  description: string;
  colors: string | null;
  size: string | null;
  quantity: number | null;
  budget: string | null;
  deadline: string | null;
  purpose: string | null;
  custom_text: string | null;
  material: string | null;
  contact_method: string | null;
  notes: string | null;
  status:
    | "new"
    | "contacted"
    | "quoted"
    | "in_progress"
    | "completed"
    | "cancelled";
};

export const LEAD_STATUSES: Lead["status"][] = [
  "new",
  "contacted",
  "quoted",
  "in_progress",
  "completed",
  "cancelled",
];

export const LEAD_STATUS_LABELS: Record<Lead["status"], string> = {
  new: "New",
  contacted: "Contacted",
  quoted: "Quoted",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

// =========================================================================
// CATEGORIES
// =========================================================================
export type Category = {
  id: string;
  created_at: string;
  slug: string;
  name: string;
  description: string | null;
  image_url: string | null;
  display_order: number;
};

// =========================================================================
// PRODUCTS
// =========================================================================
export type ProductVariant = {
  name: string;
  color_hex: string | null;
  image_url: string | null;
  stock: number | null;
};

export type PriceTier = {
  min_qty: number;
  price_pkr: number;
};

export type Product = {
  id: string;
  created_at: string;
  updated_at: string;

  name: string;
  slug: string | null;
  description: string;
  price_pkr: number;
  compare_at_price_pkr: number | null;

  category_slug: string | null;

  is_new_arrival: boolean;
  is_best_seller: boolean;
  is_featured: boolean;
  is_published: boolean;

  images: string[];
  video_url: string | null;

  stock: number;
  status: "available" | "sold_out" | "archived";

  variants: ProductVariant[] | null;
  price_tiers: PriceTier[] | null;
};

// Pick the unit price for a given ordered quantity. Tiers are matched by the
// largest min_qty <= qty. If no tier applies, basePrice (products.price_pkr)
// wins. Tiers are assumed already sorted ascending; we sort defensively anyway.
export function unitPriceForQuantity(
  basePrice: number,
  tiers: PriceTier[] | null | undefined,
  qty: number,
): number {
  if (!tiers || tiers.length === 0 || qty < 1) return basePrice;
  const sorted = [...tiers].sort((a, b) => a.min_qty - b.min_qty);
  let price = basePrice;
  for (const t of sorted) {
    if (qty >= t.min_qty) price = t.price_pkr;
  }
  return price;
}

// Resolve stock for the chosen variant. If the variant pins its own stock,
// that wins. Otherwise we treat the variant as unlimited rather than falling
// back to `products.stock` — when an admin adds colour options they typically
// don't bother filling the product-level stock counter, and the existing form
// default of 0 would otherwise make the product look sold out.
export function variantStock(
  productStock: number,
  variant: ProductVariant | null | undefined,
): number {
  if (!variant) return productStock;
  if (variant.stock === null || variant.stock === undefined) {
    return Number.MAX_SAFE_INTEGER;
  }
  return variant.stock;
}

// True when the product card/detail should display the "Sold Out" badge.
// Status is the source of truth; stock only gates availability for products
// WITHOUT variants (those rely on the product-level stock counter).
export function isProductSoldOut(
  product: Pick<Product, "status" | "stock" | "variants">,
): boolean {
  if (product.status === "sold_out") return true;
  const variants = Array.isArray(product.variants) ? product.variants : null;
  if (variants && variants.length > 0) {
    // With variants, availability is decided at variant level. If every
    // variant explicitly says 0 stock, the whole product is sold out.
    const explicit = variants
      .map((v) => v.stock)
      .filter((s): s is number => typeof s === "number");
    if (explicit.length === variants.length && explicit.every((s) => s <= 0)) {
      return true;
    }
    return false;
  }
  return product.stock <= 0;
}

export const PRODUCT_STATUSES: Product["status"][] = [
  "available",
  "sold_out",
  "archived",
];

export const PRODUCT_STATUS_LABELS: Record<Product["status"], string> = {
  available: "Available",
  sold_out: "Sold Out",
  archived: "Archived",
};

export const formatPKR = (n: number | null | undefined): string => {
  if (n === null || n === undefined) return "—";
  return `PKR ${Number(n).toLocaleString("en-PK", {
    maximumFractionDigits: 0,
  })}`;
};

export const slugify = (s: string): string =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

// =========================================================================
// CUSTOMERS
// =========================================================================
export type Customer = {
  id: string;
  created_at: string;
  updated_at: string;
  full_name: string;
  email: string;
  phone: string;
  total_orders: number;
  total_spent_pkr: number;
};

// =========================================================================
// COUPONS
// =========================================================================
export type Coupon = {
  id: string;
  created_at: string;
  code: string;
  description: string | null;
  type: "percent" | "flat";
  value: number;
  min_order_pkr: number;
  max_discount_pkr: number | null;
  starts_at: string | null;
  expires_at: string | null;
  usage_limit: number | null;
  times_used: number;
  is_active: boolean;
};

// =========================================================================
// ORDERS
// =========================================================================
export type PaymentMethod = "jazzcash" | "easypaisa";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export const PAYMENT_METHODS: PaymentMethod[] = ["jazzcash", "easypaisa"];
export const PAYMENT_STATUSES: PaymentStatus[] = [
  "pending",
  "paid",
  "failed",
  "refunded",
];
export const ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  jazzcash: "JazzCash",
  easypaisa: "EasyPaisa",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: "Awaiting Payment",
  paid: "Paid",
  failed: "Failed",
  refunded: "Refunded",
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export type Order = {
  id: string;
  created_at: string;
  updated_at: string;
  order_number: string;

  customer_id: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;

  shipping_address: string;
  city: string;
  postal_code: string | null;
  order_notes: string | null;

  subtotal_pkr: number;
  delivery_pkr: number;
  discount_pkr: number;
  total_pkr: number;

  coupon_code: string | null;

  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  payment_reference: string | null;
  payment_verified_at: string | null;
  payment_notes: string | null;

  order_status: OrderStatus;
};

export type OrderItem = {
  id: string;
  created_at: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  product_slug: string | null;
  product_image: string | null;
  unit_price_pkr: number;
  quantity: number;
  line_total_pkr: number;
  variant_name: string | null;
};

export type Payment = {
  id: string;
  created_at: string;
  order_id: string;
  method: PaymentMethod;
  status: PaymentStatus;
  amount_pkr: number;
  reference: string | null;
  notes: string | null;
};

export type OrderWithItems = Order & { items: OrderItem[] };
