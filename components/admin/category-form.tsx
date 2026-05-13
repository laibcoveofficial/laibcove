"use client";

import { useActionState, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Loader2, Save, X, Upload, ImageOff } from "lucide-react";
import { createCategory, updateCategory, type CategoryFormState } from "@/app/admin/(panel)/categories/actions";
import type { Category } from "@/lib/supabase/types";

const initialState: CategoryFormState = {
  status: "idle",
  message: "",
};

export function CategoryForm({ category }: { category?: Category }) {
  const isEditing = !!category;
  const action = isEditing ? updateCategory : createCategory;
  const [state, formAction, pending] = useActionState(action, initialState);

  const [preview, setPreview] = useState<string | null>(category?.image_url || null);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  return (
    <form action={formAction} className="space-y-8">
      {isEditing && <input type="hidden" name="id" value={category.id} />}
      
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          {/* Basic Info */}
          <section className="rounded-3xl border border-border bg-background p-6 shadow-sm sm:p-7">
            <h2 className="font-heading mb-6 text-xl text-foreground">
              General Information
            </h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="text-sm font-medium text-foreground">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  defaultValue={category?.name}
                  placeholder="e.g. Handmade Gajray"
                  className="mt-1.5 block w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/20"
                  required
                />
              </div>
              <div>
                <label htmlFor="slug" className="text-sm font-medium text-foreground">
                  Slug (optional)
                </label>
                <input
                  type="text"
                  id="slug"
                  name="slug"
                  defaultValue={category?.slug}
                  placeholder="e.g. handmade-gajray"
                  className="mt-1.5 block w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/20"
                />
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Leave empty to auto-generate from name.
                </p>
              </div>
              <div>
                <label htmlFor="description" className="text-sm font-medium text-foreground">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  defaultValue={category?.description || ""}
                  rows={4}
                  placeholder="Tell customers what's in this collection..."
                  className="mt-1.5 block w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/20"
                />
              </div>
            </div>
          </section>

          {/* Settings */}
          <section className="rounded-3xl border border-border bg-background p-6 shadow-sm sm:p-7">
            <h2 className="font-heading mb-6 text-xl text-foreground">
              Settings
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="displayOrder" className="text-sm font-medium text-foreground">
                  Display Order
                </label>
                <input
                  type="number"
                  id="displayOrder"
                  name="displayOrder"
                  defaultValue={category?.display_order || 0}
                  className="mt-1.5 block w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/20"
                />
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Lower numbers appear first.
                </p>
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-6 lg:col-span-4">
          {/* Image */}
          <section className="rounded-3xl border border-border bg-background p-6 shadow-sm sm:p-7">
            <h2 className="font-heading mb-6 text-xl text-foreground">
              Cover Image
            </h2>
            <div className="space-y-4">
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-[var(--surface-soft)] ring-1 ring-border">
                {preview ? (
                  <Image
                    src={preview}
                    alt="Preview"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center text-muted-foreground">
                    <ImageOff className="h-10 w-10 opacity-20" />
                    <p className="mt-2 text-xs">No image selected</p>
                  </div>
                )}
              </div>
              
              <input type="hidden" name="existingImage" value={category?.image_url || ""} />
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-full border border-border bg-white px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-[var(--surface-soft)]">
                <Upload className="h-4 w-4" />
                {preview ? "Change image" : "Upload image"}
                <input
                  type="file"
                  name="newImage"
                  accept="image/*"
                  onChange={onFileChange}
                  className="hidden"
                />
              </label>
            </div>
          </section>

          {/* Error Message */}
          {state.status === "error" && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
              {state.message}
            </div>
          )}

          {/* Sticky Actions (mobile) / sidebar actions (desktop) */}
          <div className="flex flex-col gap-3">
            <button
              type="submit"
              disabled={pending}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--brand)] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[var(--brand)]/25 transition-all hover:-translate-y-0.5 disabled:opacity-50"
            >
              {pending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {isEditing ? "Save changes" : "Create category"}
            </button>
            <Link
              href="/admin/categories"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-border bg-white px-6 py-3.5 text-sm font-semibold text-foreground transition-colors hover:bg-[var(--surface-soft)]"
            >
              <X className="h-4 w-4" />
              Cancel
            </Link>
          </div>
        </div>
      </div>
    </form>
  );
}
