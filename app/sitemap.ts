import type { MetadataRoute } from "next";
import { getSupabase } from "@/lib/supabase/server";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://laibcove.com";

// Re-generate at most once an hour — product/blog listings don't change often.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/shop`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/blog`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/contact`, changeFrequency: "monthly", priority: 0.5 },
  ];

  // Published products and blog posts. Best-effort — if the DB is unreachable
  // we still return the static routes rather than failing the whole sitemap.
  try {
    const supabase = getSupabase();
    const nowIso = new Date().toISOString();

    const [productsResp, postsResp] = await Promise.all([
      supabase
        .from("products")
        .select("slug, updated_at")
        .eq("is_published", true)
        .not("slug", "is", null),
      supabase
        .from("blog_posts")
        .select("slug, updated_at, published_at")
        .eq("status", "published")
        .lte("published_at", nowIso),
    ]);

    const productRoutes: MetadataRoute.Sitemap = (productsResp.data ?? [])
      .filter((p): p is { slug: string; updated_at: string } => !!p.slug)
      .map((p) => ({
        url: `${SITE_URL}/shop/${p.slug}`,
        lastModified: p.updated_at,
        changeFrequency: "weekly",
        priority: 0.8,
      }));

    const blogRoutes: MetadataRoute.Sitemap = (postsResp.data ?? [])
      .filter((p): p is { slug: string; updated_at: string; published_at: string } => !!p.slug)
      .map((p) => ({
        url: `${SITE_URL}/blog/${p.slug}`,
        lastModified: p.updated_at ?? p.published_at,
        changeFrequency: "monthly",
        priority: 0.6,
      }));

    return [...staticRoutes, ...productRoutes, ...blogRoutes];
  } catch {
    return staticRoutes;
  }
}
