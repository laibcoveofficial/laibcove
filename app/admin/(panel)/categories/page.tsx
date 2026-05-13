import Link from "next/link";
import Image from "next/image";
import { Plus, Pencil, ImageOff } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { getSupabase } from "@/lib/supabase/server";
import { type Category } from "@/lib/supabase/types";
import { Topbar } from "@/components/admin/topbar";
import { CategoryDeleteButton } from "@/components/admin/category-delete-button";
import { SaveSuccessModal } from "@/components/admin/save-success-modal";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ saved?: string; name?: string }>;

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await getSession();
  const sp = await searchParams;
  const savedVariant: "created" | "updated" | null =
    sp?.saved === "created"
      ? "created"
      : sp?.saved === "updated"
        ? "updated"
        : null;
  const savedName = typeof sp?.name === "string" ? sp.name : "";

  let categories: Category[] = [];
  let error: string | null = null;

  try {
    const supabase = getSupabase();
    const { data, error: dbError } = await supabase
      .from("categories")
      .select("*")
      .order("display_order", { ascending: true });

    if (dbError) error = dbError.message;
    else categories = (data ?? []) as Category[];
  } catch (err) {
    error = (err as Error).message;
  }

  return (
    <>
      <Topbar email={session?.email || ""} title="Categories" />
      <div className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            Manage your shop categories. These appear in the collection browse section on the homepage and in the shop filters.
          </p>
          <Link
            href="/admin/categories/new"
            className="inline-flex items-center gap-2 rounded-full bg-[var(--brand)] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[var(--brand)]/25 transition-all hover:-translate-y-0.5"
          >
            <Plus className="h-4 w-4" />
            Add category
          </Link>
        </div>

        {error ? (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
            <p className="font-semibold">Couldn&apos;t load categories.</p>
            <p className="mt-1">{error}</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-border bg-background p-10 text-center">
            <p className="font-heading text-lg text-foreground">
              No categories yet
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Create your first category to start organizing your products.
            </p>
            <Link
              href="/admin/categories/new"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-[var(--brand)] px-5 py-2.5 text-sm font-semibold text-white"
            >
              <Plus className="h-4 w-4" />
              Add category
            </Link>
          </div>
        ) : (
          <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-background">
            <table className="hidden w-full lg:table">
              <thead className="bg-[var(--surface-soft)] text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-5 py-3.5">Category</th>
                  <th className="px-5 py-3.5">Slug</th>
                  <th className="px-5 py-3.5 text-center">Order</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-sm">
                {categories.map((c) => (
                  <CategoryRow key={c.id} category={c} />
                ))}
              </tbody>
            </table>

            {/* Mobile cards */}
            <ul className="divide-y divide-border lg:hidden">
              {categories.map((c) => (
                <li key={c.id}>
                  <MobileCard category={c} />
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {savedVariant ? (
        <SaveSuccessModal variant={savedVariant} productName={savedName} />
      ) : null}
    </>
  );
}

function CategoryRow({ category }: { category: Category }) {
  return (
    <tr className="transition-colors hover:bg-[var(--surface-soft)]">
      <td className="px-5 py-3">
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-[var(--surface-soft)]">
            {category.image_url ? (
              <Image
                src={category.image_url}
                alt=""
                fill
                sizes="48px"
                className="object-cover"
                unoptimized
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-muted-foreground">
                <ImageOff className="h-4 w-4" />
              </span>
            )}
          </div>
          <p className="font-semibold text-foreground">{category.name}</p>
        </div>
      </td>
      <td className="px-5 py-3 text-muted-foreground">{category.slug}</td>
      <td className="px-5 py-3 text-center text-foreground/85">{category.display_order}</td>
      <td className="px-5 py-3">
        <div className="flex items-center justify-end gap-1.5">
          <Link
            href={`/admin/categories/${category.id}/edit`}
            aria-label="Edit"
            title="Edit"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-white text-[var(--brand)] hover:border-[var(--brand)] hover:bg-[var(--brand-soft)]"
          >
            < Pencil className="h-3.5 w-3.5" />
          </Link>
          <CategoryDeleteButton id={category.id} name={category.name} />
        </div>
      </td>
    </tr>
  );
}

function MobileCard({ category }: { category: Category }) {
  return (
    <div className="p-4">
      <div className="flex gap-3">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-[var(--surface-soft)]">
          {category.image_url ? (
            <Image
              src={category.image_url}
              alt=""
              fill
              sizes="64px"
              className="object-cover"
              unoptimized
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-muted-foreground">
              <ImageOff className="h-4 w-4" />
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">
            {category.name}
          </p>
          <p className="text-xs text-muted-foreground">
            {category.slug} · Order: {category.display_order}
          </p>
        </div>
      </div>
      <div className="mt-3 flex justify-end gap-1.5">
        <Link
          href={`/admin/categories/${category.id}/edit`}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-white text-[var(--brand)]"
        >
          <Pencil className="h-3.5 w-3.5" />
        </Link>
        <CategoryDeleteButton id={category.id} name={category.name} />
      </div>
    </div>
  );
}
