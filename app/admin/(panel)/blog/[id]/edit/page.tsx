import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSupabase } from "@/lib/supabase/server";
import { BlogPostForm } from "@/components/admin/blog-post-form";
import type { BlogPost } from "@/lib/blog/types";

export const metadata: Metadata = { title: "Edit Post — Blog Admin | Laibcove" };
export const dynamic = "force-dynamic";

export default async function EditBlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = getSupabase();
  const { data } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!data) notFound();

  return (
    <div className="flex min-h-screen flex-col">
      <BlogPostForm post={data as BlogPost} />
    </div>
  );
}
