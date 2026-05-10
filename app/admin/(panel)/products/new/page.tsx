import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { getSupabase } from "@/lib/supabase/server";
import type { Category } from "@/lib/supabase/types";
import { Topbar } from "@/components/admin/topbar";
import { ProductForm } from "@/components/admin/product-form";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const session = await getSession();

  let categories: Category[] = [];
  try {
    const supabase = getSupabase();
    const { data } = await supabase
      .from("categories")
      .select("*")
      .order("display_order");
    categories = (data ?? []) as Category[];
  } catch {
    // categories optional — form still works
  }

  return (
    <>
      <Topbar email={session?.email || ""} title="New Product" />
      <div className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-[var(--brand)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to products
        </Link>

        <div className="mt-5">
          <ProductForm mode="create" categories={categories} />
        </div>
      </div>
    </>
  );
}
