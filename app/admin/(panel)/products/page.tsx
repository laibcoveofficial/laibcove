import Link from "next/link";
import Image from "next/image";
import { Plus, Pencil, ImageOff, Eye, EyeOff } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { getSupabase } from "@/lib/supabase/server";
import { formatPKR, type Product } from "@/lib/supabase/types";
import { Topbar } from "@/components/admin/topbar";
import { ProductDeleteButton } from "@/components/admin/product-delete-button";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const session = await getSession();

  let products: Product[] = [];
  let error: string | null = null;

  try {
    const supabase = getSupabase();
    const { data, error: dbError } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (dbError) error = dbError.message;
    else products = (data ?? []) as Product[];
  } catch (err) {
    error = (err as Error).message;
  }

  return (
    <>
      <Topbar email={session?.email || ""} title="Products" />
      <div className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            All shop items. Toggle placement flags to control where each one
            appears on the website.
          </p>
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 rounded-full bg-[var(--brand)] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[var(--brand)]/25 transition-all hover:-translate-y-0.5"
          >
            <Plus className="h-4 w-4" />
            Add product
          </Link>
        </div>

        {error ? (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
            <p className="font-semibold">Couldn&apos;t load products.</p>
            <p className="mt-1">{error}</p>
          </div>
        ) : products.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-border bg-background p-10 text-center">
            <p className="font-heading text-lg text-foreground">
              No products yet
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Add your first product to start populating the shop.
            </p>
            <Link
              href="/admin/products/new"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-[var(--brand)] px-5 py-2.5 text-sm font-semibold text-white"
            >
              <Plus className="h-4 w-4" />
              Add product
            </Link>
          </div>
        ) : (
          <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-background">
            <table className="hidden w-full lg:table">
              <thead className="bg-[var(--surface-soft)] text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-5 py-3.5">Product</th>
                  <th className="px-5 py-3.5">Category</th>
                  <th className="px-5 py-3.5">Price</th>
                  <th className="px-5 py-3.5">Stock</th>
                  <th className="px-5 py-3.5">Placement</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-sm">
                {products.map((p) => (
                  <ProductRow key={p.id} product={p} />
                ))}
              </tbody>
            </table>

            {/* Mobile cards */}
            <ul className="divide-y divide-border lg:hidden">
              {products.map((p) => (
                <li key={p.id}>
                  <MobileCard product={p} />
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </>
  );
}

function PlacementBadges({ p }: { p: Product }) {
  return (
    <div className="flex flex-wrap items-center gap-1">
      {!p.is_published ? (
        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-600">
          <EyeOff className="h-3 w-3" />
          Hidden
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
          <Eye className="h-3 w-3" />
          Live
        </span>
      )}
      {p.is_featured ? (
        <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
          Featured
        </span>
      ) : null}
      {p.is_new_arrival ? (
        <span className="rounded-full bg-[var(--brand-soft)] px-2 py-0.5 text-[10px] font-semibold text-[var(--brand)]">
          New
        </span>
      ) : null}
      {p.is_best_seller ? (
        <span className="rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-semibold text-purple-700">
          Best seller
        </span>
      ) : null}
    </div>
  );
}

function ProductRow({ product }: { product: Product }) {
  const cover = product.images?.[0];
  return (
    <tr className="transition-colors hover:bg-[var(--surface-soft)]">
      <td className="px-5 py-3">
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-[var(--surface-soft)]">
            {cover ? (
              <Image
                src={cover}
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
          <div className="min-w-0">
            <p className="truncate font-semibold text-foreground">
              {product.name}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {product.slug ?? "—"}
            </p>
          </div>
        </div>
      </td>
      <td className="px-5 py-3 text-foreground/85">
        {product.category_slug ?? "—"}
      </td>
      <td className="px-5 py-3 text-foreground">
        {formatPKR(product.price_pkr)}
      </td>
      <td className="px-5 py-3 text-foreground/85">{product.stock}</td>
      <td className="px-5 py-3">
        <PlacementBadges p={product} />
      </td>
      <td className="px-5 py-3">
        <div className="flex items-center justify-end gap-1.5">
          <Link
            href={`/admin/products/${product.id}/edit`}
            aria-label="Edit"
            title="Edit"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-white text-[var(--brand)] hover:border-[var(--brand)] hover:bg-[var(--brand-soft)]"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Link>
          <ProductDeleteButton id={product.id} name={product.name} />
        </div>
      </td>
    </tr>
  );
}

function MobileCard({ product }: { product: Product }) {
  const cover = product.images?.[0];
  return (
    <div className="p-4">
      <div className="flex gap-3">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-[var(--surface-soft)]">
          {cover ? (
            <Image
              src={cover}
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
            {product.name}
          </p>
          <p className="text-xs text-muted-foreground">
            {product.category_slug ?? "—"} · {formatPKR(product.price_pkr)}
          </p>
          <div className="mt-2">
            <PlacementBadges p={product} />
          </div>
        </div>
      </div>
      <div className="mt-3 flex justify-end gap-1.5">
        <Link
          href={`/admin/products/${product.id}/edit`}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-white text-[var(--brand)]"
        >
          <Pencil className="h-3.5 w-3.5" />
        </Link>
        <ProductDeleteButton id={product.id} name={product.name} />
      </div>
    </div>
  );
}
