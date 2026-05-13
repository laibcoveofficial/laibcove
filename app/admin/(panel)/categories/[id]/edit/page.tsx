import { notFound } from "next/navigation";
import { Topbar } from "@/components/admin/topbar";
import { getSession } from "@/lib/auth/session";
import { getSupabase } from "@/lib/supabase/server";
import { CategoryForm } from "@/components/admin/category-form";
import { type Category } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();

  const supabase = getSupabase();
  const { data: category } = await supabase
    .from("categories")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!category) notFound();

  return (
    <>
      <Topbar email={session?.email || ""} title="Edit Category" />
      <div className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <header className="mb-8">
            <h1 className="font-heading text-3xl text-foreground">
              Edit Category
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Update {category.name} collection details and image.
            </p>
          </header>

          <CategoryForm category={category as Category} />
        </div>
      </div>
    </>
  );
}
