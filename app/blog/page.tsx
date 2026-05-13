import type { Metadata } from "next";
import Link from "next/link";
import { Calendar, User, ArrowRight, FileText } from "lucide-react";
import { AnnouncementBar } from "@/components/site/announcement-bar";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { getSupabase } from "@/lib/supabase/server";
import { lazyPublishScheduledPosts } from "@/app/admin/(panel)/blog/actions";
import type { BlogPost } from "@/lib/blog/types";

export const metadata: Metadata = {
  title: "Blog — Laibcove | Handmade Crochet Stories & Inspiration",
  description:
    "Behind-the-scenes stories, crochet tips, and inspiration from the Laibcove studio. Handcrafted content for handmade lovers.",
};

export const dynamic = "force-dynamic";

function formatDate(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-PK", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function BlogListPage() {
  // Lazy-publish any overdue scheduled posts
  await lazyPublishScheduledPosts();

  const supabase = getSupabase();
  const { data } = await supabase
    .from("blog_posts")
    .select("id, title, slug, excerpt, featured_image, published_at, author_name, status")
    .eq("status", "published")
    .lte("published_at", new Date().toISOString())
    .order("published_at", { ascending: false });

  const posts = (data ?? []) as Pick<
    BlogPost,
    "id" | "title" | "slug" | "excerpt" | "featured_image" | "published_at" | "author_name" | "status"
  >[];

  return (
    <>
      <AnnouncementBar />
      <Header />
      <main className="flex flex-1 flex-col">
        {/* Hero */}
        <section className="bg-[var(--brand-soft)] py-16 sm:py-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand)]">
              Our Journal
            </span>
            <h1 className="font-heading mt-3 text-4xl text-foreground sm:text-5xl">
              Stories from the Studio
            </h1>
            <p className="mt-4 text-base text-muted-foreground max-w-xl mx-auto">
              Behind-the-scenes moments, crochet inspiration, and everything handmade from the Laibcove team.
            </p>
          </div>
        </section>

        {/* Posts grid */}
        <section className="bg-background py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {posts.length === 0 ? (
              <div className="flex flex-col items-center py-24 text-center">
                <FileText className="h-12 w-12 text-muted-foreground/30" />
                <p className="mt-4 text-lg font-semibold text-foreground">No posts yet</p>
                <p className="mt-1 text-sm text-muted-foreground">Check back soon — we're writing something lovely.</p>
              </div>
            ) : (
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {posts.map((post) => (
                  <article
                    key={post.id}
                    className="group flex flex-col overflow-hidden rounded-3xl border border-border bg-background shadow-sm hover:shadow-lg transition-shadow"
                  >
                    <Link href={`/blog/${post.slug}`} className="block overflow-hidden">
                      {post.featured_image ? (
                        <img
                          src={post.featured_image}
                          alt={post.title}
                          className="h-52 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-52 w-full items-center justify-center bg-[var(--brand-soft)] text-[var(--brand)]/30">
                          <FileText className="h-16 w-16" />
                        </div>
                      )}
                    </Link>

                    <div className="flex flex-1 flex-col p-6">
                      <div className="mb-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDate(post.published_at)}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="h-3.5 w-3.5" />
                          {post.author_name}
                        </span>
                      </div>

                      <Link href={`/blog/${post.slug}`}>
                        <h2 className="font-heading text-xl text-foreground group-hover:text-[var(--brand)] transition-colors line-clamp-2">
                          {post.title}
                        </h2>
                      </Link>

                      {post.excerpt && (
                        <p className="mt-2 flex-1 text-sm text-muted-foreground line-clamp-3">
                          {post.excerpt}
                        </p>
                      )}

                      <Link
                        href={`/blog/${post.slug}`}
                        className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--brand)] hover:gap-2.5 transition-all"
                      >
                        Read more <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
