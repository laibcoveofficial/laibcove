import { Topbar } from "@/components/admin/topbar";
import { getSession } from "@/lib/auth/session";
import { CategoryForm } from "@/components/admin/category-form";

export default async function NewCategoryPage() {
  const session = await getSession();

  return (
    <>
      <Topbar email={session?.email || ""} title="New Category" />
      <div className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <header className="mb-8">
            <h1 className="font-heading text-3xl text-foreground">
              Add New Category
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Create a new collection to organize your products.
            </p>
          </header>

          <CategoryForm />
        </div>
      </div>
    </>
  );
}
