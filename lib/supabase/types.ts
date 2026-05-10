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
};

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
