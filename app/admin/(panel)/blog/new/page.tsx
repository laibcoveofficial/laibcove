import type { Metadata } from "next";
import { BlogPostForm } from "@/components/admin/blog-post-form";

export const metadata: Metadata = { title: "New Post — Blog Admin | Laibcove" };

export default function NewBlogPostPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <BlogPostForm />
    </div>
  );
}
