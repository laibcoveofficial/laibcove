import "server-only";
import { getSupabase } from "./server";

const BUCKET = "blog-images";
const FALLBACK_BUCKET = "product-images";

const safeName = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]/g, "-")
    .replace(/-+/g, "-");

export async function uploadBlogImage(file: File): Promise<string> {
  const supabase = getSupabase();
  const ext = file.name.includes(".") ? file.name.split(".").pop() : "jpg";
  const key = `${crypto.randomUUID()}-${safeName(
    file.name.replace(/\.[^.]+$/, ""),
  )}.${ext}`;

  // Proactively attempt to create the public bucket just in case it doesn't exist
  await supabase.storage.createBucket(BUCKET, { public: true }).catch(() => {});

  // Try uploading to primary bucket
  let res = await supabase.storage.from(BUCKET).upload(key, file, {
    contentType: file.type || "image/jpeg",
    cacheControl: "31536000",
    upsert: false,
  });

  let targetBucket = BUCKET;

  // Fallback to product-images if primary bucket isn't found or permissions prevent dynamic creation
  if (res.error && res.error.message.toLowerCase().includes("bucket")) {
    targetBucket = FALLBACK_BUCKET;
    res = await supabase.storage.from(targetBucket).upload(key, file, {
      contentType: file.type || "image/jpeg",
      cacheControl: "31536000",
      upsert: false,
    });
  }

  if (res.error) throw new Error(`Upload failed: ${res.error.message}`);

  const { data } = supabase.storage.from(targetBucket).getPublicUrl(key);
  return data.publicUrl;
}

export async function deleteBlogImage(publicUrl: string): Promise<void> {
  const supabase = getSupabase();
  
  // Determine which bucket holds the image based on the URL path
  const usesFallback = publicUrl.includes(`/${FALLBACK_BUCKET}/`);
  const bucketName = usesFallback ? FALLBACK_BUCKET : BUCKET;

  const marker = `/storage/v1/object/public/${bucketName}/`;
  const idx = publicUrl.indexOf(marker);
  if (idx === -1) return;
  const key = publicUrl.slice(idx + marker.length);
  if (!key) return;
  await supabase.storage.from(bucketName).remove([key]);
}
