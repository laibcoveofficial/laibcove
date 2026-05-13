"use client";

import {
  useActionState,
  useEffect,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Loader2,
  ImageIcon,
  X,
} from "lucide-react";
import { RichEditor } from "@/components/admin/blog-editor";
import { createBlogPost, updateBlogPost, type BlogFormState } from "@/app/admin/(panel)/blog/actions";
import { uploadBlogImageAction } from "@/app/admin/(panel)/blog/upload-action";
import { slugifyBlog, type BlogPost, type BlogFaq } from "@/lib/blog/types";

const INIT_STATE: BlogFormState = { status: "idle", message: "" };

const inputClass =
  "block w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/20 transition-colors";

const labelClass =
  "block text-xs font-semibold uppercase tracking-wide text-foreground mb-1.5";

/* ─── FAQ Section ──────────────────────────────────────────────────────────── */
function FaqSection({
  faqs,
  setFaqs,
}: {
  faqs: BlogFaq[];
  setFaqs: (f: BlogFaq[]) => void;
}) {
  const add = () => setFaqs([...faqs, { question: "", answer: "" }]);
  const remove = (i: number) => setFaqs(faqs.filter((_, j) => j !== i));
  const update = (i: number, field: keyof BlogFaq, val: string) =>
    setFaqs(faqs.map((f, j) => (j === i ? { ...f, [field]: val } : f)));

  return (
    <div className="rounded-2xl border border-border bg-background p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">FAQ Section</h3>
        <button
          type="button"
          onClick={add}
          className="flex items-center gap-1.5 rounded-lg bg-[var(--brand-soft)] px-3 py-1.5 text-xs font-semibold text-[var(--brand)] hover:bg-[var(--brand)] hover:text-white transition-colors"
        >
          <Plus className="h-3.5 w-3.5" /> Add FAQ
        </button>
      </div>

      {faqs.length === 0 && (
        <p className="text-xs text-muted-foreground">No FAQs yet. Add one above.</p>
      )}

      <div className="space-y-4">
        {faqs.map((faq, i) => (
          <div key={i} className="rounded-xl border border-border bg-[var(--surface-soft)] p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">FAQ {i + 1}</span>
              <button
                type="button"
                onClick={() => remove(i)}
                className="flex h-6 w-6 items-center justify-center rounded-full text-red-400 hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
            <input
              type="text"
              placeholder="Question"
              value={faq.question}
              onChange={(e) => update(i, "question", e.target.value)}
              className={inputClass + " mb-2"}
            />
            <textarea
              placeholder="Answer"
              rows={3}
              value={faq.answer}
              onChange={(e) => update(i, "answer", e.target.value)}
              className={inputClass}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Featured Image ───────────────────────────────────────────────────────── */
function FeaturedImagePicker({
  existingUrl,
  fileInputRef,
  onRemove,
}: {
  existingUrl: string | null;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onRemove: () => void;
}) {
  const [preview, setPreview] = useState<string | null>(existingUrl);

  return (
    <div className="rounded-2xl border border-border bg-background p-5">
      <p className={labelClass}>Featured Image</p>
      {preview ? (
        <div className="relative">
          <img src={preview} alt="Featured" className="h-40 w-full rounded-xl object-cover" />
          <button
            type="button"
            onClick={() => { setPreview(null); onRemove(); if (fileInputRef.current) fileInputRef.current.value = ""; }}
            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex h-40 w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border text-muted-foreground hover:border-[var(--brand)] hover:text-[var(--brand)] transition-colors"
        >
          <ImageIcon className="h-8 w-8" />
          <span className="text-xs font-medium">Click to upload image</span>
        </button>
      )}
      <input
        ref={fileInputRef}
        type="file"
        name="featuredImageFile"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) setPreview(URL.createObjectURL(f));
        }}
      />
    </div>
  );
}

/* ─── Main Blog Form ───────────────────────────────────────────────────────── */
export function BlogPostForm({ post }: { post?: BlogPost }) {
  const isEdit = Boolean(post);
  const action = isEdit ? updateBlogPost : createBlogPost;

  const [state, formAction, pending] = useActionState(action, INIT_STATE);

  const [content, setContent] = useState(post?.content ?? "");
  const [faqs, setFaqs] = useState<BlogFaq[]>(post?.faqs ?? []);

  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [slugEdited, setSlugEdited] = useState(isEdit);

  useEffect(() => {
    if (!slugEdited && title) setSlug(slugifyBlog(title));
  }, [title, slugEdited]);

  const [removeImage, setRemoveImage] = useState(false);
  const [status, setStatus] = useState<string>(post?.status ?? "draft");
  const [scheduledAt, setScheduledAt] = useState(
    post?.scheduled_at ? post.scheduled_at.slice(0, 16) : ""
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Editor inline image upload via server action
  const handleEditorImageUpload = async (file: File): Promise<string> => {
    const fd = new FormData();
    fd.append("file", file);
    return uploadBlogImageAction(fd);
  };

  return (
    <form action={formAction}>
      {/* Hidden state fields */}
      {post && <input type="hidden" name="id" value={post.id} />}
      <input type="hidden" name="content" value={content} />
      <input type="hidden" name="faqs" value={JSON.stringify(faqs)} />
      <input type="hidden" name="status" value={status} />
      <input type="hidden" name="slug" value={slug} />
      {removeImage && <input type="hidden" name="removeFeaturedImage" value="1" />}

      {/* ── Topbar ── */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background px-6 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/blog"
            className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            All Posts
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="text-sm font-semibold text-foreground">
            {isEdit ? "Edit Post" : "New Post"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {state.status === "error" && (
            <p className="max-w-xs truncate text-xs text-red-600">{state.message}</p>
          )}
          <button
            type="submit"
            formNoValidate
            onClick={() => setStatus("draft")}
            disabled={pending}
            className="rounded-xl border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-[var(--surface-soft)] disabled:opacity-50 transition-colors"
          >
            {pending && status === "draft" ? <Loader2 className="inline h-4 w-4 animate-spin mr-1" /> : null}
            Save Draft
          </button>
          <button
            type="submit"
            disabled={pending}
            className="flex items-center gap-2 rounded-xl bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-[var(--brand)]/25 hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {pending && status !== "draft" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {status === "scheduled"
              ? isEdit
                ? "Update Schedule"
                : "Schedule Post"
              : isEdit
                ? "Update & Publish"
                : "Publish Now"}
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[1fr_320px] lg:px-8">
        {/* Left */}
        <div className="space-y-5 min-w-0">
          {/* Title */}
          <input
            name="title"
            type="text"
            placeholder="Post Title…"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="block w-full rounded-2xl border border-border bg-background px-5 py-4 text-2xl font-bold text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/20 transition-colors"
          />

          {/* Slug bar */}
          <div className="flex items-center gap-2 rounded-2xl border border-border bg-background px-5 py-2.5 text-xs text-muted-foreground">
            <span className="shrink-0 font-medium">Slug:</span>
            <span className="text-foreground/40">/blog/</span>
            <input
              type="text"
              value={slug}
              onChange={(e) => { setSlug(e.target.value); setSlugEdited(true); }}
              className="flex-1 bg-transparent text-xs text-foreground outline-none"
              placeholder="auto-generated-from-title"
            />
          </div>

          {/* Excerpt */}
          <div className="rounded-2xl border border-border bg-background p-5">
            <label className={labelClass}>Excerpt / Sub-heading</label>
            <textarea
              name="excerpt"
              rows={2}
              defaultValue={post?.excerpt ?? ""}
              placeholder="A short summary shown in blog listings…"
              className={inputClass}
            />
          </div>

          {/* Editor */}
          <div>
            <p className={labelClass + " mb-2"}>Content</p>
            <RichEditor
              initialValue={post?.content ?? ""}
              onChange={setContent}
              onImageUpload={handleEditorImageUpload}
            />
          </div>

          {/* FAQs */}
          <FaqSection faqs={faqs} setFaqs={setFaqs} />
        </div>

        {/* Right sidebar */}
        <aside className="space-y-5 lg:sticky lg:top-[57px] lg:self-start">
          {/* Featured image */}
          <FeaturedImagePicker
            existingUrl={post?.featured_image ?? null}
            fileInputRef={fileInputRef}
            onRemove={() => setRemoveImage(true)}
          />

          {/* SEO */}
          <div className="rounded-2xl border border-border bg-background p-5 space-y-4">
            <h3 className="text-sm font-semibold text-foreground">SEO</h3>
            <div>
              <label className={labelClass}>SEO Title</label>
              <input name="seoTitle" type="text" defaultValue={post?.seo_title ?? ""} placeholder="Same as title if empty" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Meta Description</label>
              <textarea name="seoDescription" rows={3} defaultValue={post?.seo_description ?? ""} placeholder="150–160 characters…" className={inputClass} />
            </div>
          </div>

          {/* Author */}
          <div className="rounded-2xl border border-border bg-background p-5">
            <label className={labelClass}>Author</label>
            <input name="authorName" type="text" defaultValue={post?.author_name ?? "Laibcove Team"} className={inputClass} />
          </div>

          {/* Scheduling */}
          <div className="rounded-2xl border border-border bg-background p-5 space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Publishing</h3>
            <div>
              <label className={labelClass}>Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputClass}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="scheduled">Scheduled</option>
              </select>
            </div>
            {status === "scheduled" && (
              <div>
                <label className={labelClass}>Publish At</label>
                <input
                  name="scheduledAt"
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className={inputClass}
                />
                <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                  The lazy scheduler will auto-publish this post the next time any blog page is visited after this date/time.
                </p>
              </div>
            )}
            <div className="flex flex-col gap-2">
              <button
                type="submit"
                disabled={pending}
                className="w-full rounded-xl bg-[var(--brand)] py-2.5 text-sm font-semibold text-white disabled:opacity-50 transition-opacity hover:opacity-90"
              >
                {pending
                  ? "Saving…"
                  : status === "scheduled"
                    ? isEdit
                      ? "Update Schedule"
                      : "Schedule Post"
                    : isEdit
                      ? "Update & Publish"
                      : "Publish Now"}
              </button>
              <button
                type="submit"
                onClick={() => setStatus("draft")}
                disabled={pending}
                className="w-full rounded-xl border border-border py-2.5 text-sm font-semibold text-foreground disabled:opacity-50 hover:bg-[var(--surface-soft)] transition-colors"
              >
                Save Draft
              </button>
              {isEdit && (
                <Link
                  href={`/blog/${post!.slug}`}
                  target="_blank"
                  className="block w-full rounded-xl border border-border py-2.5 text-center text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-[var(--surface-soft)] transition-colors"
                >
                  View on Site ↗
                </Link>
              )}
            </div>
          </div>
        </aside>
      </div>
    </form>
  );
}
