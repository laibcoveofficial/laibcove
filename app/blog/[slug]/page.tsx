import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Calendar, User, Clock, ChevronDown, ArrowRight, Sparkles, ShoppingBag } from "lucide-react";
import { AnnouncementBar } from "@/components/site/announcement-bar";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { getSupabase } from "@/lib/supabase/server";
import { lazyPublishScheduledPosts } from "@/app/admin/(panel)/blog/actions";
import type { BlogPost, BlogFaq } from "@/lib/blog/types";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = getSupabase();
  const { data } = await supabase
    .from("blog_posts")
    .select("title, seo_title, seo_description, featured_image")
    .eq("slug", slug)
    .maybeSingle();

  if (!data) return { title: "Post Not Found" };

  return {
    title: data.seo_title || `${data.title} — Laibcove Blog`,
    description: data.seo_description ?? undefined,
    openGraph: data.featured_image
      ? { images: [{ url: data.featured_image }] }
      : undefined,
  };
}

function formatDate(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-PK", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function calculateReadingTime(text: string) {
  const words = text.replace(/<[^>]*>/g, " ").split(/\s+/).filter(Boolean).length;
  const minutes = Math.ceil(words / 200); // 200 words per minute average
  return `${minutes || 1} min read`;
}

/* FAQ accordion item */
function FaqItem({ faq }: { faq: BlogFaq }) {
  return (
    <details className="group rounded-2xl border border-border bg-background transition-colors hover:border-[var(--brand)]/40">
      <summary className="flex cursor-pointer items-center justify-between gap-4 px-5 py-4 text-sm font-semibold text-foreground marker:content-none outline-none">
        {faq.question}
        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
      </summary>
      <div className="border-t border-border px-5 py-4 text-sm leading-relaxed text-muted-foreground bg-[var(--surface-soft)]/50 rounded-b-2xl">
        {faq.answer}
      </div>
    </details>
  );
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // Lazy scheduler — publish overdue posts immediately
  await lazyPublishScheduledPosts();

  const { slug } = await params;
  const supabase = getSupabase();

  const { data } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .lte("published_at", new Date().toISOString())
    .maybeSingle();

  if (!data) notFound();

  const post = data as BlogPost;
  const faqs: BlogFaq[] = Array.isArray(post.faqs) ? post.faqs : [];
  const readingTime = calculateReadingTime(post.content);

  // Fetch up to 3 related articles
  const { data: related } = await supabase
    .from("blog_posts")
    .select("id, title, slug, featured_image, published_at")
    .eq("status", "published")
    .lte("published_at", new Date().toISOString())
    .neq("id", post.id)
    .order("published_at", { ascending: false })
    .limit(3);

  return (
    <>
      <AnnouncementBar />
      <Header />
      <main className="flex flex-1 flex-col">
        {/* ─── HERO SECTION ─────────────────────────────────────────────────── */}
        <div className="bg-[var(--brand-soft)]/60 border-b border-border/40 py-10 sm:py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl">
              {/* Breadcrumbs */}
              <nav className="mb-6 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <Link href="/" className="hover:text-[var(--brand)] transition-colors">Home</Link>
                <span>/</span>
                <Link href="/blog" className="hover:text-[var(--brand)] transition-colors">Blog</Link>
                <span>/</span>
                <span className="text-foreground truncate max-w-xs">{post.title}</span>
              </nav>

              {/* Title */}
              <h1 className="font-heading text-3xl text-foreground sm:text-4xl lg:text-5xl leading-tight">
                {post.title}
              </h1>

              {/* Meta strip */}
              <div className="mt-6 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs font-medium text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-[var(--brand)]" />
                  {formatDate(post.published_at)}
                </span>
                <span className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-[var(--brand)]" />
                  by {post.author_name || "Laibcove Team"}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-[var(--brand)]" />
                  {readingTime}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ─── TWO-COLUMN MAIN LAYOUT ───────────────────────────────────────── */}
        <section className="bg-background py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-12 lg:items-start">
              
              {/* ─── LEFT COLUMN: ARTICLE CONTENT ─── */}
              <div className="lg:col-span-8 space-y-10 min-w-0">
                
                {/* Featured Image at the very top */}
                {post.featured_image && (
                  <div className="overflow-hidden rounded-3xl border border-border shadow-sm">
                    <img
                      src={post.featured_image}
                      alt={post.title}
                      className="w-full h-auto max-h-[500px] object-cover"
                    />
                  </div>
                )}

                {/* Overview / Excerpt Block */}
                {post.excerpt && (
                  <div className="relative overflow-hidden rounded-2xl border border-[var(--brand)]/30 bg-[var(--brand-soft)]/50 p-6 sm:p-8">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-[var(--brand)]" />
                    <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--brand)] mb-2">
                      <Sparkles className="h-3.5 w-3.5" /> Overview
                    </span>
                    <p className="text-base font-medium text-foreground/90 leading-relaxed italic">
                      "{post.excerpt}"
                    </p>
                  </div>
                )}

                {/* Rich Content Render */}
                <div
                  className="blog-content prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />

                {/* FAQs Section */}
                {faqs.length > 0 && (
                  <div className="pt-6 border-t border-border">
                    <h2 className="font-heading mb-6 text-2xl text-foreground">
                      Frequently Asked Questions
                    </h2>
                    <div className="space-y-3">
                      {faqs.map((faq, i) => (
                        <FaqItem key={i} faq={faq} />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* ─── RIGHT COLUMN: STICKY CTA SIDEBAR ─── */}
              <aside className="lg:col-span-4 lg:sticky lg:top-28 space-y-6">
                <div className="overflow-hidden rounded-3xl border border-border bg-background shadow-md">
                  {/* Decorative Banner Image */}
                  <div className="h-40 w-full bg-gradient-to-br from-[var(--brand)] to-[var(--brand-soft)] relative flex items-center justify-center p-6 text-center">
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
                    <h3 className="relative font-heading text-2xl text-white drop-shadow-sm">
                      Handcrafted Elegance
                    </h3>
                  </div>

                  <div className="p-6 text-center space-y-4">
                    <p className="text-xs font-semibold uppercase tracking-widest text-[var(--brand)]">
                      Explore Gajray & Bouquets
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Every piece is custom handcrafted with exceptional love and premium details right in Wah Cantt.
                    </p>

                    <Link
                      href="/shop"
                      className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-[var(--brand)] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[var(--brand)]/25 hover:opacity-90 transition-opacity"
                    >
                      <ShoppingBag className="h-4 w-4" /> Shop Custom Creations
                    </Link>
                  </div>
                </div>

                {/* Secondary Help block */}
                <div className="rounded-2xl border border-border bg-[var(--surface-soft)] p-5 text-center">
                  <p className="text-xs font-semibold text-foreground">Need a bespoke order?</p>
                  <p className="mt-1 text-xs text-muted-foreground">Reach out via WhatsApp for immediate support.</p>
                  <Link
                    href="/contact"
                    className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[var(--brand)] hover:underline"
                  >
                    Contact Support <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </aside>

            </div>
          </div>
        </section>

        {/* ─── RELATED ARTICLES SECTION ─────────────────────────────────────── */}
        {related && related.length > 0 && (
          <section className="border-t border-border bg-[var(--surface-soft)] py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-[var(--brand)]">
                    Keep Reading
                  </span>
                  <h2 className="font-heading mt-1 text-2xl text-foreground">Related Articles</h2>
                </div>
                <Link
                  href="/blog"
                  className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--brand)] hover:underline"
                >
                  View All Posts <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((p: { id: string; title: string; slug: string; featured_image: string | null; published_at: string | null }) => (
                  <Link
                    key={p.id}
                    href={`/blog/${p.slug}`}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-background hover:shadow-lg transition-all duration-300"
                  >
                    {p.featured_image ? (
                      <img
                        src={p.featured_image}
                        alt={p.title}
                        className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="h-48 w-full bg-[var(--brand-soft)] flex items-center justify-center text-[var(--brand)]/30 font-semibold text-xs">
                        Laibcove Journal
                      </div>
                    )}
                    <div className="flex flex-1 flex-col p-5">
                      <p className="mb-2 text-xs font-medium text-muted-foreground">
                        {formatDate(p.published_at)}
                      </p>
                      <h3 className="font-heading text-lg text-foreground group-hover:text-[var(--brand)] transition-colors line-clamp-2">
                        {p.title}
                      </h3>
                      <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-[var(--brand)] opacity-0 group-hover:opacity-100 transition-opacity">
                        Read Story <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>

              <div className="mt-8 text-center sm:hidden">
                <Link
                  href="/blog"
                  className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--brand)] hover:underline"
                >
                  View All Posts <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
