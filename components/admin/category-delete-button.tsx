"use client";

import { useTransition } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { deleteCategory } from "@/app/admin/(panel)/categories/actions";

export function CategoryDeleteButton({
  id,
  name,
}: {
  id: string;
  name: string;
}) {
  const [pending, start] = useTransition();

  const onClick = () => {
    if (
      !window.confirm(
        `Delete category "${name}"? This will not delete products in this category, but they will become uncategorized.`,
      )
    )
      return;
    const fd = new FormData();
    fd.set("id", id);
    start(() => {
      deleteCategory(fd);
    });
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      aria-label={`Delete ${name}`}
      title="Delete"
      className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-white text-red-600 transition-colors hover:border-red-300 hover:bg-red-50 disabled:opacity-60"
    >
      {pending ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Trash2 className="h-3.5 w-3.5" />
      )}
    </button>
  );
}
