import type { MetadataRoute } from "next";

// Served at /robots.txt. Allows crawling of the public storefront while keeping
// the admin panel and personal/transactional pages out of search results.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://laibcove.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/orders/", "/checkout/", "/cart"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
