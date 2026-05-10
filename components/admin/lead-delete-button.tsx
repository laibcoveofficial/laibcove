"use client";

import { useTransition } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { deleteLead } from "@/app/admin/(panel)/leads/[id]/actions";

export function LeadDeleteButton({
  id,
  name,
  variant = "icon",
}: {
  id: string;
  name: string;
  variant?: "icon" | "labeled";
}) {
  const [pending, start] = useTransition();

  const onClick = () => {
    if (
      !window.confirm(
        `Delete the lead from ${name}? This cannot be undone.`,
      )
    )
      return;
    const fd = new FormData();
    fd.set("id", id);
    start(() => {
      deleteLead(fd);
    });
  };

  if (variant === "labeled") {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        className="inline-flex items-center gap-1.5 rounded-full border border-red-300 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 transition-colors hover:bg-red-50 disabled:opacity-60"
      >
        {pending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Trash2 className="h-3.5 w-3.5" />
        )}
        Delete
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      aria-label={`Delete lead from ${name}`}
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
