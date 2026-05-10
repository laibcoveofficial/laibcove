import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { getSupabase } from "@/lib/supabase/server";
import type { Category, Product } from "@/lib/supabase/types";
import { Topbar } from "@/components/admin/topbar";
import { ProductForm } from "@/components/admin/product-form";
import { ProductDeleteButton } from "@/components/admin/product-delete-button";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string }>;
}) {
  const session = await getSession();
  const { id } = await params;
  const sp = await searchParams;

  let product: Product | null = null;
  let categories: Category[] = [];
  let error: string | null = null;

  try {
    const supabase = getSupabase();
    const [productResp, categoriesResp] = await Promise.all([
      supabase.from("products").select("*").eq("id", id).maybeSingle(),
      supabase.from("categories").select("*").order("display_order"),
    ]);

    if (productResp.error) {
      error = productResp.error.message;
    } else {
      product = productResp.data as Product | null;
    }
    categories = (categoriesResp.data ?? []) as Category[];
  } catch (err) {
    error = (err as Error).message;
  }

  if (!error && !product) notFound();

  return (
    <>
      <Topbar email={session?.email || ""} title="Edit Product" />
      <div className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-[var(--brand)]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to products
          </Link>
          {product ? (
            <ProductDeleteButton
              id={product.id}
              name={product.name}
              variant="labeled"
            />
          ) : null}
        </div>

        {error ? (
          <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
            <p className="font-semibold">Couldn&apos;t load this product.</p>
            <p className="mt-1">{error}</p>
          </div>
        ) : product ? (
          <div className="mt-5">
            <ProductForm
              mode="edit"
              product={product}
              categories={categories}
              showCreatedToast={sp?.created === "1"}
            />
          </div>
        ) : null}
      </div>
    </>
  );
}
