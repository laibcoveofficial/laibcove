import type { Metadata } from "next";
import Link from "next/link";
import { Plus, FileText, Calendar, Eye, EyeOff, Clock } from "lucide-react";
import { getSupabase } from "@/lib/supabase/server";
import { lazyPublishScheduledPosts } from "./actions";
import { Topbar } from "@/components/admin/topbar";
import type { BlogPost, BlogStatus } from "@/lib/blog/types";
import { BLOG_STATUS_LABELS } from "@/lib/blog/types";

export const metadata: Metadata = { title: "Blog — Admin | Laibcove" };
export const dynamic = "force-dynamic";

const STATUS_COLORS: Record<BlogStatus, string> = {
  published: "bg-emerald-100 text-emerald-800",
  draft: "bg-gray-100 text-gray-700",
  scheduled: "bg-amber-100 text-amber-800",
};

const STATUS_ICONS: Record<BlogStatus, React.ElementType> = {
  published: Eye,
  draft: EyeOff,
  scheduled: Clock,
};

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-PK", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function AdminBlogPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; title?: string }>;
}) {
  // Run lazy scheduler on every admin view too
  await lazyPublishScheduledPosts();

  const sp = await searchParams;
  const savedMsg =
    sp.saved === "created"
      ? `"${sp.title}" was created.`
      : sp.saved === "updated"
        ? `"${sp.title}" was updated.`
        : null;

  const supabase = getSupabase();
  const { data: posts } = await supabase
    .from("blog_posts")
    .select("*")
    .order("created_at", { ascending: false });

  const rows = (posts ?? []) as BlogPost[];

  return (
    <>
      <Topbar title="Blog" />
      <main className="flex-1 overflow-y-auto px-4 py-8 sm:px-6 lg:px-8">
        {savedMsg && (
          <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-medium text-emerald-800">
            ✓ {savedMsg}
          </div>
        )}

        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Blog Posts</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {rows.length} post{rows.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Link
            href="/admin/blog/new"
            className="flex items-center gap-2 rounded-xl bg-[var(--brand)] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[var(--brand)]/25 hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            New Post
          </Link>
        </div>

        {rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-border py-24 text-center">
            <FileText className="h-12 w-12 text-muted-foreground/40" />
            <p className="mt-4 text-lg font-semibold text-foreground">No posts yet</p>
            <p className="mt-1 text-sm text-muted-foreground">Create your first blog post to get started.</p>
            <Link
              href="/admin/blog/new"
              className="mt-6 flex items-center gap-2 rounded-xl bg-[var(--brand)] px-5 py-2.5 text-sm font-semibold text-white"
            >
              <Plus className="h-4 w-4" /> Write First Post
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border bg-background">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-[var(--surface-soft)]">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Title</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</th>
                  <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:table-cell">Published</th>
                  <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground lg:table-cell">Author</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((post) => {
                  const Icon = STATUS_ICONS[post.status];
                  return (
                    <tr key={post.id} className="group hover:bg-[var(--surface-soft)] transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {post.featured_image ? (
                            <img
                              src={post.featured_image}
                              alt=""
                              className="h-10 w-14 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="flex h-10 w-14 items-center justify-center rounded-lg bg-[var(--surface-soft)] text-muted-foreground/40">
                              <FileText className="h-5 w-5" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="truncate font-medium text-foreground">{post.title}</p>
                            <p className="truncate text-xs text-muted-foreground">/blog/{post.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_COLORS[post.status]}`}>
                          <Icon className="h-3 w-3" />
                          {BLOG_STATUS_LABELS[post.status]}
                        </span>
                      </td>
                      <td className="hidden px-4 py-3 text-xs text-muted-foreground sm:table-cell">
                        {post.status === "scheduled"
                          ? `Scheduled: ${formatDate(post.scheduled_at)}`
                          : formatDate(post.published_at)}
                      </td>
                      <td className="hidden px-4 py-3 text-xs text-muted-foreground lg:table-cell">
                        {post.author_name}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/blog/${post.slug}`}
                            target="_blank"
                            className="rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-[var(--surface-soft)] hover:text-foreground"
                          >
                            View
                          </Link>
                          <Link
                            href={`/admin/blog/${post.id}/edit`}
                            className="rounded-lg bg-[var(--brand-soft)] px-3 py-1.5 text-xs font-semibold text-[var(--brand)] hover:bg-[var(--brand)] hover:text-white transition-colors"
                          >
                            Edit
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </>
  );
}
