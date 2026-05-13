"use server";

import { getSession } from "@/lib/auth/session";
import { uploadBlogImage } from "@/lib/supabase/blog-storage";

/** Server action to upload a single blog image. Called from client components. */
export async function uploadBlogImageAction(formData: FormData): Promise<string> {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) throw new Error("No file provided.");

  return uploadBlogImage(file);
}
