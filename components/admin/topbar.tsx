"use client";

import { Menu, UserCircle2 } from "lucide-react";
import { useAdminUI } from "@/lib/admin/ui-context";

export function Topbar({ email, title }: { email: string; title: string }) {
  const { openSidebar } = useAdminUI();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-border bg-background/80 px-4 backdrop-blur sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-2">
        <button
          type="button"
          onClick={openSidebar}
          aria-label="Open navigation menu"
          className="-ml-2 inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground/80 transition-colors hover:bg-[var(--surface-soft)] hover:text-[var(--brand)] lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="font-heading truncate text-xl text-foreground sm:text-2xl">
          {title}
        </h1>
      </div>
      <div className="flex shrink-0 items-center gap-2 rounded-full border border-border bg-[var(--surface-soft)] py-1.5 pl-2 pr-3 text-sm text-foreground/80 sm:pr-4">
        <UserCircle2 className="h-5 w-5 text-[var(--brand)]" />
        <span className="hidden truncate sm:inline">{email}</span>
      </div>
    </header>
  );
}
