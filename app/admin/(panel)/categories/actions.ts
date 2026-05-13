"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getSupabase } from "@/lib/supabase/server";
import { uploadProductImage, deleteProductImage } from "@/lib/supabase/storage";
import { slugify, type Category } from "@/lib/supabase/types";

export type CategoryFormState = {
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

async function requireAdmin() {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
}

function revalidateCategoryPaths() {
  revalidatePath("/admin/categories");
  revalidatePath("/shop");
  revalidatePath("/");
}

async function handleImageUpload(formData: FormData): Promise<string | null> {
  const file = formData.get("newImage");
  if (file instanceof File && file.size > 0) {
    return await uploadProductImage(file);
  }
  return null;
}

export async function createCategory(
  _prev: CategoryFormState,
  formData: FormData,
): Promise<CategoryFormState> {
  await requireAdmin();

  const name = text(formData.get("name"));
  const slug = text(formData.get("slug")) || slugify(name);
  const description = text(formData.get("description"));
  const displayOrder = num(formData.get("displayOrder")) ?? 0;

  if (!name) return { status: "error", message: "Name is required." };

  let imageUrl: string | null = null;
  try {
    imageUrl = await handleImageUpload(formData);
  } catch (e) {
    return { status: "error", message: (e as Error).message };
  }

  const supabase = getSupabase();
  const { error } = await supabase.from("categories").insert({
    name,
    slug,
    description,
    display_order: displayOrder,
    image_url: imageUrl,
  });

  if (error) {
    if (imageUrl) await deleteProductImage(imageUrl);
    return { status: "error", message: error.message };
  }

  revalidateCategoryPaths();
  redirect(`/admin/categories?saved=created&name=${encodeURIComponent(name)}`);
}

export async function updateCategory(
  _prev: CategoryFormState,
  formData: FormData,
): Promise<CategoryFormState> {
  await requireAdmin();

  const id = text(formData.get("id"));
  if (!id) return { status: "error", message: "Missing id." };

  const name = text(formData.get("name"));
  const slug = text(formData.get("slug")) || slugify(name);
  const description = text(formData.get("description"));
  const displayOrder = num(formData.get("displayOrder")) ?? 0;
  const existingImage = text(formData.get("existingImage"));

  if (!name) return { status: "error", message: "Name is required." };

  let newImageUrl: string | null = null;
  try {
    newImageUrl = await handleImageUpload(formData);
  } catch (e) {
    return { status: "error", message: (e as Error).message };
  }

  const finalImageUrl = newImageUrl || existingImage || null;

  const supabase = getSupabase();
  
  // Get old image for cleanup if we uploaded a new one
  const { data: old } = await supabase.from("categories").select("image_url").eq("id", id).single();

  const { error } = await supabase
    .from("categories")
    .update({
      name,
      slug,
      description,
      display_order: displayOrder,
      image_url: finalImageUrl,
    })
    .eq("id", id);

  if (error) {
    if (newImageUrl) await deleteProductImage(newImageUrl);
    return { status: "error", message: error.message };
  }

  if (newImageUrl && old?.image_url && old.image_url !== newImageUrl) {
    await deleteProductImage(old.image_url);
  }

  revalidateCategoryPaths();
  redirect(`/admin/categories?saved=updated&name=${encodeURIComponent(name)}`);
}

export async function deleteCategory(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = text(formData.get("id"));
  if (!id) throw new Error("Missing id");

  const supabase = getSupabase();
  const { data: existing } = await supabase.from("categories").select("image_url").eq("id", id).single();

  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw new Error(error.message);

  if (existing?.image_url) {
    await deleteProductImage(existing.image_url);
  }

  revalidateCategoryPaths();
  redirect("/admin/categories");
}
