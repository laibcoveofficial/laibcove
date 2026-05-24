"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  Loader2,
  Save,
  Upload,
  X,
  AlertCircle,
  CheckCircle2,
  Plus,
  Trash2,
} from "lucide-react";
import {
  createProduct,
  updateProduct,
  type ProductFormState,
} from "@/app/admin/(panel)/products/actions";
import {
  PRODUCT_STATUSES,
  PRODUCT_STATUS_LABELS,
  type Category,
  type Product,
  type ProductVariant,
  type PriceTier,
} from "@/lib/supabase/types";

const initial: ProductFormState = { status: "idle", message: "" };

const fieldClass =
  "w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/70 outline-none transition-all focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/20";

const labelClass = "mb-1.5 block text-sm font-medium text-foreground";

type Props = {
  mode: "create" | "edit";
  categories: Category[];
  product?: Product;
};

type PendingFile = { id: string; file: File; previewUrl: string };

// Editable form state for a single colour variation. `existingImageUrl` is
// kept on edits; `newFile` replaces it when admin re-uploads.
type VariantRow = {
  id: string;
  name: string;
  color_hex: string;
  existingImageUrl: string | null;
  newFile: File | null;
  newFilePreview: string | null;
  stock: string; // string so empty stays empty (means "use product stock")
};

type TierRow = {
  id: string;
  min_qty: string;
  price_pkr: string;
};

const rid = () => Math.random().toString(36).slice(2, 9);

export function ProductForm({ mode, categories, product }: Props) {
  const action = mode === "create" ? createProduct : updateProduct;
  const [state, formAction, pending] = useActionState(action, initial);

  const [existingImages, setExistingImages] = useState<string[]>(
    product?.images ?? [],
  );
  const [newFiles, setNewFiles] = useState<PendingFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [variants, setVariants] = useState<VariantRow[]>(() => {
    const src = (product?.variants ?? []) as ProductVariant[];
    return src.map((v) => ({
      id: rid(),
      name: v.name ?? "",
      color_hex: v.color_hex ?? "#000000",
      existingImageUrl: v.image_url ?? null,
      newFile: null,
      newFilePreview: null,
      stock: v.stock === null || v.stock === undefined ? "" : String(v.stock),
    }));
  });

  const [tiers, setTiers] = useState<TierRow[]>(() => {
    const src = (product?.price_tiers ?? []) as PriceTier[];
    return src.map((t) => ({
      id: rid(),
      min_qty: String(t.min_qty),
      price_pkr: String(t.price_pkr),
    }));
  });

  const variantFileInputs = useRef<Record<string, HTMLInputElement | null>>({});

  // Mirror each variant's `newFile` into its hidden <input type="file"> so the
  // form submission picks it up (same DataTransfer trick as the gallery).
  useEffect(() => {
    if (typeof DataTransfer === "undefined") return;
    for (const v of variants) {
      const input = variantFileInputs.current[v.id];
      if (!input) continue;
      const dt = new DataTransfer();
      if (v.newFile) dt.items.add(v.newFile);
      input.files = dt.files;
    }
  }, [variants]);

  // Keep the <input type="file"> in sync with our newFiles state so the form
  // submission actually includes every selected file. Browsers don't append to
  // <input multiple> across separate picks, and clearing .value loses them
  // entirely. We rebuild .files from state via DataTransfer.
  useEffect(() => {
    const input = fileInputRef.current;
    if (!input) return;
    if (typeof DataTransfer === "undefined") return;
    const dt = new DataTransfer();
    for (const pf of newFiles) dt.items.add(pf.file);
    input.files = dt.files;
  }, [newFiles]);

  const onAddFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const incoming = Array.from(e.target.files).map((file) => ({
      id: `${file.name}-${file.size}-${file.lastModified}-${Math.random()}`,
      file,
      previewUrl: URL.createObjectURL(file),
    }));
    setNewFiles((prev) => [...prev, ...incoming].slice(0, 8));
    // Don't clear input.value here — the useEffect above will rebuild .files
    // from the merged state. (Picking the same file twice is fine: the
    // dedupe-by-id key keeps a unique row in newFiles anyway.)
  };

  const removeNewFile = (id: string) => {
    setNewFiles((prev) => {
      const removed = prev.find((p) => p.id === id);
      if (removed) URL.revokeObjectURL(removed.previewUrl);
      return prev.filter((p) => p.id !== id);
    });
  };

  const removeExistingImage = (url: string) => {
    setExistingImages((prev) => prev.filter((u) => u !== url));
  };

  const addVariant = () =>
    setVariants((prev) => [
      ...prev,
      {
        id: rid(),
        name: "",
        color_hex: "#000000",
        existingImageUrl: null,
        newFile: null,
        newFilePreview: null,
        stock: "",
      },
    ]);

  const updateVariant = (id: string, patch: Partial<VariantRow>) =>
    setVariants((prev) => prev.map((v) => (v.id === id ? { ...v, ...patch } : v)));

  const removeVariant = (id: string) =>
    setVariants((prev) => {
      const removed = prev.find((v) => v.id === id);
      if (removed?.newFilePreview) URL.revokeObjectURL(removed.newFilePreview);
      return prev.filter((v) => v.id !== id);
    });

  const onVariantFile = (id: string, file: File | null) => {
    setVariants((prev) =>
      prev.map((v) => {
        if (v.id !== id) return v;
        if (v.newFilePreview) URL.revokeObjectURL(v.newFilePreview);
        return {
          ...v,
          newFile: file,
          newFilePreview: file ? URL.createObjectURL(file) : null,
          // Uploading a new file replaces any existing image
          existingImageUrl: file ? null : v.existingImageUrl,
        };
      }),
    );
  };

  const clearVariantImage = (id: string) => {
    setVariants((prev) =>
      prev.map((v) => {
        if (v.id !== id) return v;
        if (v.newFilePreview) URL.revokeObjectURL(v.newFilePreview);
        return {
          ...v,
          newFile: null,
          newFilePreview: null,
          existingImageUrl: null,
        };
      }),
    );
  };

  const addTier = () =>
    setTiers((prev) => [
      ...prev,
      { id: rid(), min_qty: prev.length === 0 ? "2" : "", price_pkr: "" },
    ]);

  const updateTier = (id: string, patch: Partial<TierRow>) =>
    setTiers((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));

  const removeTier = (id: string) =>
    setTiers((prev) => prev.filter((t) => t.id !== id));

  const isEdit = mode === "edit" && product;

  return (
    <form action={formAction} className="space-y-8">
      {isEdit ? <input type="hidden" name="id" value={product.id} /> : null}
      {existingImages.map((url) => (
        <input key={url} type="hidden" name="existingImages" value={url} />
      ))}


      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main column */}
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl border border-border bg-background p-6">
            <h2 className="font-heading text-lg text-foreground">Basics</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              The core info that shows on the product card.
            </p>

            <div className="mt-5 space-y-4">
              <div>
                <label htmlFor="name" className={labelClass}>
                  Product name <span className="text-[var(--brand)]">*</span>
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  defaultValue={product?.name}
                  placeholder="Daisy Bloom Tote"
                  className={fieldClass}
                />
              </div>

              <div>
                <label htmlFor="slug" className={labelClass}>
                  URL slug{" "}
                  <span className="font-normal text-muted-foreground">
                    (optional — auto-generated from name if left empty)
                  </span>
                </label>
                <input
                  id="slug"
                  name="slug"
                  type="text"
                  defaultValue={product?.slug ?? ""}
                  placeholder="daisy-bloom-tote"
                  className={fieldClass}
                />
              </div>

              <div>
                <label htmlFor="description" className={labelClass}>
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={6}
                  defaultValue={product?.description ?? ""}
                  placeholder="Tell customers what makes this piece special — materials, dimensions, story, care."
                  className={`${fieldClass} resize-y`}
                />
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="rounded-2xl border border-border bg-background p-6">
            <h2 className="font-heading text-lg text-foreground">
              Pricing & inventory
            </h2>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="price" className={labelClass}>
                  Price (PKR){" "}
                  <span className="text-[var(--brand)]">*</span>
                </label>
                <input
                  id="price"
                  name="price"
                  type="number"
                  step="1"
                  min="0"
                  required
                  defaultValue={product?.price_pkr ?? ""}
                  placeholder="4500"
                  className={fieldClass}
                />
              </div>
              <div>
                <label htmlFor="compareAtPrice" className={labelClass}>
                  Compare-at price{" "}
                  <span className="font-normal text-muted-foreground">
                    (optional — shown crossed-out)
                  </span>
                </label>
                <input
                  id="compareAtPrice"
                  name="compareAtPrice"
                  type="number"
                  step="1"
                  min="0"
                  defaultValue={product?.compare_at_price_pkr ?? ""}
                  placeholder="6000"
                  className={fieldClass}
                />
              </div>
              <div>
                <label htmlFor="stock" className={labelClass}>
                  Stock
                </label>
                <input
                  id="stock"
                  name="stock"
                  type="number"
                  min="0"
                  defaultValue={product?.stock ?? 0}
                  placeholder="0"
                  className={fieldClass}
                />
              </div>
              <div>
                <label htmlFor="status" className={labelClass}>
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  defaultValue={product?.status ?? "available"}
                  className={fieldClass}
                >
                  {PRODUCT_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {PRODUCT_STATUS_LABELS[s]}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Media */}
          <div className="rounded-2xl border border-border bg-background p-6">
            <h2 className="font-heading text-lg text-foreground">Media</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Up to 8 images. The first image is the main cover.
            </p>

            <div className="mt-5">
              <span className={labelClass}>Images</span>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-[var(--surface-soft)] px-4 py-8 text-sm text-muted-foreground transition-colors hover:border-[var(--brand)] hover:bg-[var(--brand-soft)]/40 hover:text-[var(--brand)]"
              >
                <Upload className="h-6 w-6" />
                <span className="font-medium">Click to upload</span>
                <span className="text-xs">PNG / JPG / WebP — up to 5MB each</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                name="newImages"
                multiple
                accept="image/*"
                onChange={onAddFiles}
                className="hidden"
              />

              {(existingImages.length > 0 || newFiles.length > 0) && (
                <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {existingImages.map((url, i) => (
                    <li
                      key={url}
                      className="group relative overflow-hidden rounded-xl border border-border bg-[var(--surface-soft)]"
                    >
                      <div className="relative aspect-square">
                        <Image
                          src={url}
                          alt=""
                          fill
                          sizes="200px"
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      {i === 0 ? (
                        <span className="absolute left-2 top-2 rounded-full bg-[var(--brand)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
                          Cover
                        </span>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => removeExistingImage(url)}
                        aria-label="Remove image"
                        className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-foreground shadow-sm transition-colors hover:bg-red-500 hover:text-white"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </li>
                  ))}
                  {newFiles.map((pf) => (
                    <li
                      key={pf.id}
                      className="group relative overflow-hidden rounded-xl border border-dashed border-[var(--brand)]/50 bg-[var(--surface-soft)]"
                    >
                      <div className="relative aspect-square">
                        <Image
                          src={pf.previewUrl}
                          alt=""
                          fill
                          sizes="200px"
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <span className="absolute left-2 top-2 rounded-full bg-[var(--brand)]/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
                        New
                      </span>
                      <button
                        type="button"
                        onClick={() => removeNewFile(pf.id)}
                        aria-label="Remove image"
                        className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-foreground shadow-sm transition-colors hover:bg-red-500 hover:text-white"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="mt-6">
              <label htmlFor="videoUrl" className={labelClass}>
                Video URL{" "}
                <span className="font-normal text-muted-foreground">
                  (optional — paste a YouTube, Vimeo, or direct .mp4 URL)
                </span>
              </label>
              <input
                id="videoUrl"
                name="videoUrl"
                type="url"
                defaultValue={product?.video_url ?? ""}
                placeholder="https://www.youtube.com/watch?v=..."
                className={fieldClass}
              />
            </div>
          </div>

          {/* Color variations */}
          <div className="rounded-2xl border border-border bg-background p-6">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h2 className="font-heading text-lg text-foreground">
                  Color variations
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Optional. Add a colour swatch + image for each available
                  colour. Leave empty for products with no colour choice.
                </p>
              </div>
              <button
                type="button"
                onClick={addVariant}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:border-[var(--brand)] hover:text-[var(--brand)]"
              >
                <Plus className="h-3.5 w-3.5" />
                Add color
              </button>
            </div>

            <input
              type="hidden"
              name="variantCount"
              value={String(variants.length)}
            />

            {variants.length === 0 ? (
              <p className="mt-5 rounded-xl border border-dashed border-border bg-[var(--surface-soft)] px-4 py-6 text-center text-xs text-muted-foreground">
                No color options. Customers buy this product as-is.
              </p>
            ) : (
              <ul className="mt-5 space-y-4">
                {variants.map((v, i) => (
                  <li
                    key={v.id}
                    className="rounded-xl border border-border bg-[var(--surface-soft)] p-4"
                  >
                    <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto_auto_auto] sm:items-end">
                      <div>
                        <label className={labelClass}>
                          Color name <span className="text-[var(--brand)]">*</span>
                        </label>
                        <input
                          type="text"
                          name={`variantName_${i}`}
                          required
                          value={v.name}
                          onChange={(e) =>
                            updateVariant(v.id, { name: e.target.value })
                          }
                          placeholder="Red"
                          className={fieldClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Swatch</label>
                        <input
                          type="color"
                          name={`variantColorHex_${i}`}
                          value={v.color_hex}
                          onChange={(e) =>
                            updateVariant(v.id, { color_hex: e.target.value })
                          }
                          className="h-12 w-14 cursor-pointer rounded-xl border border-border bg-white"
                        />
                      </div>
                      <div>
                        <label className={labelClass}>
                          Stock{" "}
                          <span className="font-normal text-muted-foreground">
                            (opt.)
                          </span>
                        </label>
                        <input
                          type="number"
                          min="0"
                          name={`variantStock_${i}`}
                          value={v.stock}
                          onChange={(e) =>
                            updateVariant(v.id, { stock: e.target.value })
                          }
                          placeholder="—"
                          className={`${fieldClass} w-24`}
                        />
                      </div>
                      <div>
                        <span className={labelClass}>Image</span>
                        <div className="flex items-center gap-2">
                          {v.newFilePreview ? (
                            <div className="relative h-12 w-12 overflow-hidden rounded-lg border border-border bg-white">
                              <Image
                                src={v.newFilePreview}
                                alt=""
                                fill
                                sizes="48px"
                                className="object-cover"
                                unoptimized
                              />
                            </div>
                          ) : v.existingImageUrl ? (
                            <div className="relative h-12 w-12 overflow-hidden rounded-lg border border-border bg-white">
                              <Image
                                src={v.existingImageUrl}
                                alt=""
                                fill
                                sizes="48px"
                                className="object-cover"
                                unoptimized
                              />
                            </div>
                          ) : null}
                          <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-2 text-xs font-medium text-foreground transition-colors hover:border-[var(--brand)] hover:text-[var(--brand)]">
                            <Upload className="h-3.5 w-3.5" />
                            {v.existingImageUrl || v.newFile ? "Replace" : "Upload"}
                            <input
                              ref={(el) => {
                                variantFileInputs.current[v.id] = el;
                              }}
                              type="file"
                              name={`variantImage_${i}`}
                              accept="image/*"
                              onChange={(e) =>
                                onVariantFile(v.id, e.target.files?.[0] ?? null)
                              }
                              className="hidden"
                            />
                          </label>
                          {v.existingImageUrl || v.newFile ? (
                            <button
                              type="button"
                              onClick={() => clearVariantImage(v.id)}
                              aria-label="Remove image"
                              className="inline-flex h-7 w-7 items-center justify-center rounded-full text-foreground/50 hover:bg-red-50 hover:text-red-600"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          ) : null}
                        </div>
                        {v.existingImageUrl && !v.newFile ? (
                          <input
                            type="hidden"
                            name={`variantExistingImage_${i}`}
                            value={v.existingImageUrl}
                          />
                        ) : null}
                      </div>
                      <div>
                        <button
                          type="button"
                          onClick={() => removeVariant(v.id)}
                          aria-label="Remove color"
                          className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-foreground/60 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Quantity-based pricing */}
          <div className="rounded-2xl border border-border bg-background p-6">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h2 className="font-heading text-lg text-foreground">
                  Quantity pricing
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Optional bulk discount. Each row sets a unit price that kicks
                  in once the buyer reaches that quantity. Leave empty to use
                  the regular price for any quantity.
                </p>
              </div>
              <button
                type="button"
                onClick={addTier}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:border-[var(--brand)] hover:text-[var(--brand)]"
              >
                <Plus className="h-3.5 w-3.5" />
                Add tier
              </button>
            </div>

            <input
              type="hidden"
              name="tierCount"
              value={String(tiers.length)}
            />

            {tiers.length === 0 ? (
              <p className="mt-5 rounded-xl border border-dashed border-border bg-[var(--surface-soft)] px-4 py-6 text-center text-xs text-muted-foreground">
                No quantity discounts. Unit price stays the same at any quantity.
              </p>
            ) : (
              <ul className="mt-5 space-y-3">
                {tiers.map((t, i) => (
                  <li
                    key={t.id}
                    className="grid gap-3 rounded-xl border border-border bg-[var(--surface-soft)] p-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
                  >
                    <div>
                      <label className={labelClass}>
                        When buying at least
                      </label>
                      <input
                        type="number"
                        min="2"
                        name={`tierMinQty_${i}`}
                        value={t.min_qty}
                        onChange={(e) =>
                          updateTier(t.id, { min_qty: e.target.value })
                        }
                        placeholder="2"
                        className={fieldClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>
                        Unit price (PKR)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        name={`tierPrice_${i}`}
                        value={t.price_pkr}
                        onChange={(e) =>
                          updateTier(t.id, { price_pkr: e.target.value })
                        }
                        placeholder="900"
                        className={fieldClass}
                      />
                    </div>
                    <div>
                      <button
                        type="button"
                        onClick={() => removeTier(t.id)}
                        aria-label="Remove tier"
                        className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-foreground/60 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-3 text-[11px] text-muted-foreground">
              Tip: the regular price is the &ldquo;1 item&rdquo; price. Tiers
              start from 2 or more.
            </p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-background p-6">
            <h2 className="font-heading text-lg text-foreground">Placement</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Decide where this product appears on the website.
            </p>

            <div className="mt-5">
              <label htmlFor="category" className={labelClass}>
                Category
              </label>
              <select
                id="category"
                name="category"
                defaultValue={product?.category_slug ?? ""}
                className={fieldClass}
              >
                <option value="">No category</option>
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-5 space-y-3">
              {[
                {
                  name: "isPublished",
                  label: "Published",
                  desc: "Visible on the public site",
                  defaultOn: product?.is_published ?? true,
                },
                {
                  name: "isFeatured",
                  label: "Featured",
                  desc: "Highlight this product",
                  defaultOn: product?.is_featured ?? false,
                },
                {
                  name: "isNewArrival",
                  label: "New Arrival",
                  desc: "Show in the New Arrivals section",
                  defaultOn: product?.is_new_arrival ?? false,
                },
                {
                  name: "isBestSeller",
                  label: "Best Seller",
                  desc: "Show in the Best Sellers section",
                  defaultOn: product?.is_best_seller ?? false,
                },
              ].map((flag) => (
                <label
                  key={flag.name}
                  className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-[var(--surface-soft)] p-3 transition-colors has-[:checked]:border-[var(--brand)] has-[:checked]:bg-[var(--brand-soft)]"
                >
                  <input
                    type="checkbox"
                    name={flag.name}
                    defaultChecked={flag.defaultOn}
                    className="mt-1 h-4 w-4 rounded border-border accent-[var(--brand)]"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">
                      {flag.label}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {flag.desc}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {state.status === "error" && state.message ? (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{state.message}</p>
        </div>
      ) : null}

      <div className="sticky bottom-0 -mx-4 flex flex-wrap justify-end gap-3 border-t border-border bg-background/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--brand)] px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-[var(--brand)]/25 transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {pending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {mode === "create" ? "Creating…" : "Saving…"}
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              {mode === "create" ? "Create product" : "Save changes"}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
