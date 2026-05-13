"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getSupabase } from "@/lib/supabase/server";
import { uploadBlogImage, deleteBlogImage } from "@/lib/supabase/blog-storage";
import { slugifyBlog, type BlogFaq } from "@/lib/blog/types";

export type BlogFormState = {
  status: "idle" | "error";
  message: string;
};

const text = (v: FormDataEntryValue | null) =>
  typeof v === "string" ? v.trim() : "";

async function requireAdmin() {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
}

function revalidateBlogPaths(slug?: string) {
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  if (slug) {
    revalidatePath(`/admin/blog/${slug}/edit`);
    revalidatePath(`/blog/${slug}`);
  }
  revalidatePath("/");
}

function parseStatus(
  statusVal: string,
  scheduledAt: string | null,
): { status: string; published_at: string | null; scheduled_at: string | null } {
  if (statusVal === "published") {
    return { status: "published", published_at: new Date().toISOString(), scheduled_at: null };
  }
  if (statusVal === "scheduled" && scheduledAt) {
    return { status: "scheduled", published_at: null, scheduled_at: scheduledAt };
  }
  return { status: "draft", published_at: null, scheduled_at: null };
}

function readFormFields(formData: FormData) {
  const title = text(formData.get("title"));
  const slug = text(formData.get("slug")) || slugifyBlog(title);
  const excerpt = text(formData.get("excerpt")) || null;
  const content = text(formData.get("content"));
  const seoTitle = text(formData.get("seoTitle")) || null;
  const seoDescription = text(formData.get("seoDescription")) || null;
  const authorName = text(formData.get("authorName")) || "Laibcove Team";
  const statusVal = text(formData.get("status")) || "draft";
  const scheduledAt = text(formData.get("scheduledAt")) || null;

  // Parse FAQs from JSON string
  let faqs: BlogFaq[] = [];
  try {
    const raw = text(formData.get("faqs"));
    if (raw) faqs = JSON.parse(raw);
  } catch {
    faqs = [];
  }

  const { status, published_at, scheduled_at } = parseStatus(statusVal, scheduledAt);

  return {
    title,
    slug,
    excerpt,
    content,
    seoTitle,
    seoDescription,
    authorName,
    status,
    published_at,
    scheduled_at,
    faqs,
  };
}

function validate(fields: ReturnType<typeof readFormFields>): string | null {
  if (!fields.title) return "Title is required.";
  if (!fields.slug) return "Slug is required.";
  if (!fields.content) return "Content cannot be empty.";
  return null;
}

// ─── CREATE ──────────────────────────────────────────────────────────────────
export async function createBlogPost(
  _prev: BlogFormState,
  formData: FormData,
): Promise<BlogFormState> {
  await requireAdmin();

  const fields = readFormFields(formData);
  const err = validate(fields);
  if (err) return { status: "error", message: err };

  // Handle featured image upload
  let featuredImage: string | null = null;
  const imageFile = formData.get("featuredImageFile");
  if (imageFile instanceof File && imageFile.size > 0) {
    try {
      featuredImage = await uploadBlogImage(imageFile);
    } catch (e) {
      return { status: "error", message: (e as Error).message };
    }
  }

  const supabase = getSupabase();
  const { error } = await supabase.from("blog_posts").insert({
    title: fields.title,
    slug: fields.slug,
    excerpt: fields.excerpt,
    content: fields.content,
    featured_image: featuredImage,
    seo_title: fields.seoTitle,
    seo_description: fields.seoDescription,
    faqs: fields.faqs,
    status: fields.status,
    published_at: fields.published_at,
    scheduled_at: fields.scheduled_at,
    author_name: fields.authorName,
  });

  if (error) {
    if (featuredImage) await deleteBlogImage(featuredImage).catch(() => {});
    return { status: "error", message: error.message };
  }

  revalidateBlogPaths(fields.slug);
  redirect(`/admin/blog?saved=created&title=${encodeURIComponent(fields.title)}`);
}

// ─── UPDATE ──────────────────────────────────────────────────────────────────
export async function updateBlogPost(
  _prev: BlogFormState,
  formData: FormData,
): Promise<BlogFormState> {
  await requireAdmin();

  const id = text(formData.get("id"));
  if (!id) return { status: "error", message: "Missing post id." };

  const fields = readFormFields(formData);
  const err = validate(fields);
  if (err) return { status: "error", message: err };

  const supabase = getSupabase();

  // Load existing record to check for old image
  const { data: existing } = await supabase
    .from("blog_posts")
    .select("featured_image, slug")
    .eq("id", id)
    .maybeSingle();

  // Featured image handling
  let featuredImage: string | null = existing?.featured_image ?? null;
  const removeImage = formData.get("removeFeaturedImage") === "1";
  const imageFile = formData.get("featuredImageFile");

  if (removeImage) {
    if (featuredImage) await deleteBlogImage(featuredImage).catch(() => {});
    featuredImage = null;
  } else if (imageFile instanceof File && imageFile.size > 0) {
    // Upload new, delete old
    try {
      const newUrl = await uploadBlogImage(imageFile);
      if (featuredImage) await deleteBlogImage(featuredImage).catch(() => {});
      featuredImage = newUrl;
    } catch (e) {
      return { status: "error", message: (e as Error).message };
    }
  }

  const { error } = await supabase
    .from("blog_posts")
    .update({
      title: fields.title,
      slug: fields.slug,
      excerpt: fields.excerpt,
      content: fields.content,
      featured_image: featuredImage,
      seo_title: fields.seoTitle,
      seo_description: fields.seoDescription,
      faqs: fields.faqs,
      status: fields.status,
      published_at: fields.published_at,
      scheduled_at: fields.scheduled_at,
      author_name: fields.authorName,
    })
    .eq("id", id);

  if (error) return { status: "error", message: error.message };

  revalidateBlogPaths(fields.slug);
  if (existing?.slug && existing.slug !== fields.slug) {
    revalidateBlogPaths(existing.slug);
  }

  redirect(`/admin/blog?saved=updated&title=${encodeURIComponent(fields.title)}`);
}

// ─── DELETE ──────────────────────────────────────────────────────────────────
export async function deleteBlogPost(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = text(formData.get("id"));
  if (!id) throw new Error("Missing post id");

  const supabase = getSupabase();
  const { data: existing } = await supabase
    .from("blog_posts")
    .select("featured_image, slug")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase.from("blog_posts").delete().eq("id", id);
  if (error) throw new Error(error.message);

  if (existing?.featured_image) {
    await deleteBlogImage(existing.featured_image).catch(() => {});
  }

  revalidateBlogPaths(existing?.slug);
  redirect("/admin/blog");
}

// ─── LAZY SCHEDULER ──────────────────────────────────────────────────────────
// Call this on every request to the public blog page to publish overdue posts
// without relying on a background cron job.
export async function lazyPublishScheduledPosts(): Promise<void> {
  try {
    const supabase = getSupabase();
    const { data: due } = await supabase
      .from("blog_posts")
      .select("id, slug")
      .eq("status", "scheduled")
      .lte("scheduled_at", new Date().toISOString());

    if (!due || due.length === 0) return;

    const now = new Date().toISOString();
    await Promise.all(
      due.map((post: { id: string; slug: string }) =>
        supabase
          .from("blog_posts")
          .update({ status: "published", published_at: now })
          .eq("id", post.id),
      ),
    );

    // Revalidate affected paths
    due.forEach((post: { id: string; slug: string }) => {
      revalidatePath(`/blog/${post.slug}`);
    });
    revalidatePath("/blog");
    revalidatePath("/");
  } catch {
    // Lazy scheduler silently swallows errors — never break page renders
  }
}
