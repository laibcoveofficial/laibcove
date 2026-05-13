// Blog types and helpers
export type BlogStatus = "draft" | "published" | "scheduled";

export type BlogFaq = {
  question: string;
  answer: string;
};

export type BlogPost = {
  id: string;
  created_at: string;
  updated_at: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  featured_image: string | null;
  seo_title: string | null;
  seo_description: string | null;
  faqs: BlogFaq[];
  status: BlogStatus;
  published_at: string | null;
  scheduled_at: string | null;
  author_name: string;
};

export const BLOG_STATUS_LABELS: Record<BlogStatus, string> = {
  draft: "Draft",
  published: "Published",
  scheduled: "Scheduled",
};

export const slugifyBlog = (s: string): string =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
