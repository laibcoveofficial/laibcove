import { UserCircle2 } from "lucide-react";

export function Topbar({ email, title }: { email: string; title: string }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur sm:px-6 lg:px-8">
      <h1 className="font-heading text-xl text-foreground sm:text-2xl">
        {title}
      </h1>
      <div className="flex items-center gap-2 rounded-full border border-border bg-[var(--surface-soft)] py-1.5 pl-2 pr-4 text-sm text-foreground/80">
        <UserCircle2 className="h-5 w-5 text-[var(--brand)]" />
        <span className="hidden truncate sm:inline">{email}</span>
      </div>
    </header>
  );
}
