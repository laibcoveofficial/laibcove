"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getSupabase } from "@/lib/supabase/server";
import {
  uploadProductImage,
  deleteProductImage,
} from "@/lib/supabase/storage";
import {
  slugify,
  type Product,
  type ProductVariant,
  type PriceTier,
} from "@/lib/supabase/types";

const MAX_IMAGES = 8;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB

export type ProductFormState = {
  status: "idle" | "error";
  message: string;
};

const text = (v: FormDataEntryValue | null) =>
  typeof v === "string" ? v.trim() : "";

const num = (v: FormDataEntryValue | null): number | null => {
  const s = text(v);
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
};

const bool = (v: FormDataEntryValue | null) =>
  v === "on" || v === "true" || v === "1";

async function requireAdmin() {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
}

function revalidateProductPaths(productId?: string) {
  revalidatePath("/admin/products");
  if (productId) revalidatePath(`/admin/products/${productId}/edit`);
  revalidatePath("/shop");
  revalidatePath("/");
}

async function handleImageUploads(formData: FormData): Promise<string[]> {
  const files = formData.getAll("newImages").filter((f): f is File =>
    f instanceof File && f.size > 0,
  );

  if (files.length === 0) return [];
  if (files.length > MAX_IMAGES) {
    throw new Error(`Please upload at most ${MAX_IMAGES} images at once.`);
  }

  const urls: string[] = [];
  for (const file of files) {
    if (file.size > MAX_IMAGE_BYTES) {
      throw new Error(
        `"${file.name}" is larger than ${MAX_IMAGE_BYTES / 1024 / 1024} MB.`,
      );
    }
    const url = await uploadProductImage(file);
    urls.push(url);
  }
  return urls;
}

// Parse the quantity-tier pricing rows. Returns null if the admin left every
// row blank (so we store null in DB and the product uses its regular price).
function readPriceTiers(formData: FormData): {
  tiers: PriceTier[] | null;
  error: string | null;
} {
  const count = Math.max(0, Math.floor(num(formData.get("tierCount")) ?? 0));
  if (count === 0) return { tiers: null, error: null };

  const out: PriceTier[] = [];
  for (let i = 0; i < count; i++) {
    const minQty = num(formData.get(`tierMinQty_${i}`));
    const price = num(formData.get(`tierPrice_${i}`));
    // Skip fully-blank rows
    if (minQty === null && price === null) continue;
    if (minQty === null || price === null) {
      return { tiers: null, error: "Every quantity tier needs both a minimum qty and a price." };
    }
    if (minQty < 2 || !Number.isFinite(minQty)) {
      return { tiers: null, error: "Tier minimum quantity must be 2 or more." };
    }
    if (price < 0 || !Number.isFinite(price)) {
      return { tiers: null, error: "Tier price must be 0 or more." };
    }
    out.push({ min_qty: Math.floor(minQty), price_pkr: price });
  }
  if (out.length === 0) return { tiers: null, error: null };

  out.sort((a, b) => a.min_qty - b.min_qty);
  const seen = new Set<number>();
  for (const t of out) {
    if (seen.has(t.min_qty)) {
      return { tiers: null, error: "Each tier needs a unique minimum quantity." };
    }
    seen.add(t.min_qty);
  }
  return { tiers: out, error: null };
}

// Parse the colour variation rows. Uploads any new variant images. Returns
// the variants array (or null when admin defined no variants) plus the list
// of uploaded urls so they can be cleaned up on a later failure.
async function readVariants(formData: FormData): Promise<{
  variants: ProductVariant[] | null;
  uploadedUrls: string[];
  error: string | null;
}> {
  const count = Math.max(0, Math.floor(num(formData.get("variantCount")) ?? 0));
  if (count === 0) return { variants: null, uploadedUrls: [], error: null };

  const variants: ProductVariant[] = [];
  const uploadedUrls: string[] = [];
  const names = new Set<string>();

  for (let i = 0; i < count; i++) {
    const name = text(formData.get(`variantName_${i}`));
    if (!name) {
      return { variants: null, uploadedUrls, error: "Each color variation needs a name." };
    }
    if (name.length > 60) {
      return { variants: null, uploadedUrls, error: "Color names must be 60 chars or fewer." };
    }
    const key = name.toLowerCase();
    if (names.has(key)) {
      return { variants: null, uploadedUrls, error: `Duplicate color name: ${name}` };
    }
    names.add(key);

    const colorHexRaw = text(formData.get(`variantColorHex_${i}`));
    const color_hex = /^#[0-9a-fA-F]{6}$/.test(colorHexRaw) ? colorHexRaw : null;

    const stockRaw = formData.get(`variantStock_${i}`);
    const stock = num(stockRaw);
    if (stock !== null && (stock < 0 || !Number.isFinite(stock))) {
      return { variants: null, uploadedUrls, error: `Stock for "${name}" must be 0 or more.` };
    }

    let image_url: string | null = null;
    const fileEntry = formData.get(`variantImage_${i}`);
    const file = fileEntry instanceof File && fileEntry.size > 0 ? fileEntry : null;
    if (file) {
      if (file.size > MAX_IMAGE_BYTES) {
        return {
          variants: null,
          uploadedUrls,
          error: `Image for "${name}" is larger than ${MAX_IMAGE_BYTES / 1024 / 1024} MB.`,
        };
      }
      const url = await uploadProductImage(file);
      uploadedUrls.push(url);
      image_url = url;
    } else {
      const existing = text(formData.get(`variantExistingImage_${i}`));
      image_url = existing || null;
    }

    variants.push({
      name,
      color_hex,
      image_url,
      stock: stock === null ? null : Math.floor(stock),
    });
  }

  return { variants, uploadedUrls, error: null };
}

function readFormFields(formData: FormData) {
  const name = text(formData.get("name"));
  const slug = text(formData.get("slug")) || slugify(name);
  const description = text(formData.get("description"));
  const price = num(formData.get("price"));
  const compareAt = num(formData.get("compareAtPrice"));
  const category = text(formData.get("category")) || null;
  const stock = num(formData.get("stock")) ?? 0;
  const videoUrl = text(formData.get("videoUrl")) || null;
  const status = text(formData.get("status")) as Product["status"];

  return {
    name,
    slug,
    description,
    price,
    compareAt,
    category,
    stock,
    videoUrl,
    status,
    is_new_arrival: bool(formData.get("isNewArrival")),
    is_best_seller: bool(formData.get("isBestSeller")),
    is_featured: bool(formData.get("isFeatured")),
    is_published: bool(formData.get("isPublished")),
  };
}

function validate(fields: ReturnType<typeof readFormFields>): string | null {
  if (!fields.name) return "Product name is required.";
  if (fields.price === null || fields.price < 0)
    return "Price must be a non-negative number.";
  if (!["available", "sold_out", "archived"].includes(fields.status))
    return "Invalid status.";
  return null;
}

// ---------- CREATE ----------
export async function createProduct(
  _prev: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  await requireAdmin();

  const fields = readFormFields(formData);
  const err = validate(fields);
  if (err) return { status: "error", message: err };

  const { tiers, error: tiersErr } = readPriceTiers(formData);
  if (tiersErr) return { status: "error", message: tiersErr };

  let uploadedUrls: string[] = [];
  try {
    uploadedUrls = await handleImageUploads(formData);
  } catch (e) {
    return { status: "error", message: (e as Error).message };
  }

  const variantResult = await readVariants(formData);
  if (variantResult.error) {
    // Roll back variant + gallery uploads on validation failure.
    await Promise.allSettled(
      [...uploadedUrls, ...variantResult.uploadedUrls].map((u) =>
        deleteProductImage(u),
      ),
    );
    return { status: "error", message: variantResult.error };
  }

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("products")
    .insert({
      name: fields.name,
      slug: fields.slug || null,
      description: fields.description,
      price_pkr: fields.price,
      compare_at_price_pkr: fields.compareAt,
      category_slug: fields.category,
      is_new_arrival: fields.is_new_arrival,
      is_best_seller: fields.is_best_seller,
      is_featured: fields.is_featured,
      is_published: fields.is_published,
      images: uploadedUrls,
      video_url: fields.videoUrl,
      stock: fields.stock,
      status: fields.status,
      variants: variantResult.variants,
      price_tiers: tiers,
    })
    .select("id")
    .single();

  if (error) {
    await Promise.allSettled(
      [...uploadedUrls, ...variantResult.uploadedUrls].map((u) =>
        deleteProductImage(u),
      ),
    );
    return { status: "error", message: error.message };
  }

  revalidateProductPaths(data.id);
  redirect(
    `/admin/products?saved=created&name=${encodeURIComponent(fields.name)}`,
  );
}

// ---------- UPDATE ----------
export async function updateProduct(
  _prev: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  await requireAdmin();

  const id = text(formData.get("id"));
  if (!id) return { status: "error", message: "Missing product id." };

  const fields = readFormFields(formData);
  const err = validate(fields);
  if (err) return { status: "error", message: err };

  const { tiers, error: tiersErr } = readPriceTiers(formData);
  if (tiersErr) return { status: "error", message: tiersErr };

  // Existing image URLs the admin chose to keep (sent as multiple inputs)
  const keptImages = formData.getAll("existingImages")
    .map((v) => (typeof v === "string" ? v : ""))
    .filter(Boolean);

  // Upload any new images
  let newUrls: string[] = [];
  try {
    newUrls = await handleImageUploads(formData);
  } catch (e) {
    return { status: "error", message: (e as Error).message };
  }
  const finalImages = [...keptImages, ...newUrls];

  const variantResult = await readVariants(formData);
  if (variantResult.error) {
    await Promise.allSettled(
      [...newUrls, ...variantResult.uploadedUrls].map((u) =>
        deleteProductImage(u),
      ),
    );
    return { status: "error", message: variantResult.error };
  }

  const supabase = getSupabase();

  // Find any previously-saved images that the admin removed so we can purge them.
  const { data: prev } = await supabase
    .from("products")
    .select("images, variants")
    .eq("id", id)
    .maybeSingle();
  const previousImages: string[] = Array.isArray(prev?.images)
    ? (prev?.images as string[])
    : [];
  const removed = previousImages.filter((u) => !keptImages.includes(u));

  // Variant images the admin replaced or dropped — clean them up after the
  // update succeeds. Compare the previous variants' image URLs against the
  // ones still referenced in the new variants list.
  const previousVariants = (Array.isArray(prev?.variants)
    ? (prev?.variants as ProductVariant[])
    : []
  );
  const stillUsedImageUrls = new Set<string>(
    (variantResult.variants ?? [])
      .map((v) => v.image_url)
      .filter((u): u is string => !!u),
  );
  const orphanedVariantImages = previousVariants
    .map((v) => v.image_url)
    .filter((u): u is string => !!u && !stillUsedImageUrls.has(u));

  const { error } = await supabase
    .from("products")
    .update({
      name: fields.name,
      slug: fields.slug || null,
      description: fields.description,
      price_pkr: fields.price,
      compare_at_price_pkr: fields.compareAt,
      category_slug: fields.category,
      is_new_arrival: fields.is_new_arrival,
      is_best_seller: fields.is_best_seller,
      is_featured: fields.is_featured,
      is_published: fields.is_published,
      images: finalImages,
      video_url: fields.videoUrl,
      stock: fields.stock,
      status: fields.status,
      variants: variantResult.variants,
      price_tiers: tiers,
    })
    .eq("id", id);

  if (error) {
    // Roll back uploads on failure.
    await Promise.allSettled(
      [...newUrls, ...variantResult.uploadedUrls].map((u) =>
        deleteProductImage(u),
      ),
    );
    return { status: "error", message: error.message };
  }

  // Purge images that were removed from the gallery (best-effort).
  await Promise.allSettled(removed.map((u) => deleteProductImage(u)));
  // Purge orphaned variant images.
  await Promise.allSettled(
    orphanedVariantImages.map((u) => deleteProductImage(u)),
  );

  revalidateProductPaths(id);
  redirect(
    `/admin/products?saved=updated&name=${encodeURIComponent(fields.name)}`,
  );
}

// ---------- DELETE ----------
export async function deleteProduct(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = text(formData.get("id"));
  if (!id) throw new Error("Missing product id");

  const supabase = getSupabase();
  const { data: existing } = await supabase
    .from("products")
    .select("images")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);

  if (existing?.images && Array.isArray(existing.images)) {
    await Promise.allSettled(
      (existing.images as string[]).map((u) => deleteProductImage(u)),
    );
  }

  revalidateProductPaths();
  redirect("/admin/products");
}
