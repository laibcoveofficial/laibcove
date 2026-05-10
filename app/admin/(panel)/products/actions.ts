"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getSupabase } from "@/lib/supabase/server";
import {
  uploadProductImage,
  deleteProductImage,
} from "@/lib/supabase/storage";
import { slugify, type Product } from "@/lib/supabase/types";

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

  let uploadedUrls: string[] = [];
  try {
    uploadedUrls = await handleImageUploads(formData);
  } catch (e) {
    return { status: "error", message: (e as Error).message };
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
    })
    .select("id")
    .single();

  if (error) {
    // Best-effort cleanup of uploaded files if DB insert failed.
    await Promise.allSettled(uploadedUrls.map((u) => deleteProductImage(u)));
    return { status: "error", message: error.message };
  }

  revalidateProductPaths(data.id);
  redirect(`/admin/products/${data.id}/edit?created=1`);
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

  const supabase = getSupabase();

  // Find any previously-saved images that the admin removed so we can purge them.
  const { data: prev } = await supabase
    .from("products")
    .select("images")
    .eq("id", id)
    .maybeSingle();
  const previousImages: string[] = Array.isArray(prev?.images)
    ? (prev?.images as string[])
    : [];
  const removed = previousImages.filter((u) => !keptImages.includes(u));

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
    })
    .eq("id", id);

  if (error) {
    // Roll back uploads on failure.
    await Promise.allSettled(newUrls.map((u) => deleteProductImage(u)));
    return { status: "error", message: error.message };
  }

  // Purge images that were removed from the gallery (best-effort).
  await Promise.allSettled(removed.map((u) => deleteProductImage(u)));

  revalidateProductPaths(id);
  return { status: "idle", message: "Saved." };
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
