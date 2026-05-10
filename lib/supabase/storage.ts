import "server-only";
import { getSupabase } from "./server";

const BUCKET = "product-images";

const safeName = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]/g, "-")
    .replace(/-+/g, "-");

export async function uploadProductImage(file: File): Promise<string> {
  const supabase = getSupabase();
  const ext = file.name.includes(".") ? file.name.split(".").pop() : "jpg";
  const key = `${crypto.randomUUID()}-${safeName(
    file.name.replace(/\.[^.]+$/, ""),
  )}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(key, file, {
      contentType: file.type || "image/jpeg",
      cacheControl: "31536000",
      upsert: false,
    });
  if (error) throw new Error(`Upload failed: ${error.message}`);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(key);
  return data.publicUrl;
}

export async function deleteProductImage(publicUrl: string): Promise<void> {
  const supabase = getSupabase();
  // Extract storage key from public URL.
  // Public URL format: <project>/storage/v1/object/public/product-images/<key>
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const idx = publicUrl.indexOf(marker);
  if (idx === -1) return;
  const key = publicUrl.slice(idx + marker.length);
  if (!key) return;
  await supabase.storage.from(BUCKET).remove([key]);
}
