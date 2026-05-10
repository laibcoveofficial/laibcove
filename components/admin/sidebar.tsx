"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Package, LogOut } from "lucide-react";

const links = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard, exact: true },
  { label: "Leads", href: "/admin/leads", icon: Users },
  { label: "Products", href: "/admin/products", icon: Package },
];

export function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");

  return (
    <aside className="hidden w-64 shrink-0 border-r border-border bg-background lg:flex lg:flex-col">
      <div className="flex h-16 items-center gap-2 border-b border-border px-6">
        <Image
          src="/logo.png"
          alt="Laibcove"
          width={673}
          height={245}
          className="h-8 w-auto object-contain"
        />
      </div>

      <nav className="flex-1 px-3 py-5">
        <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Manage
        </p>
        <ul className="space-y-1">
          {links.map(({ label, href, icon: Icon, exact }) => {
            const active = isActive(href, exact);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                    active
                      ? "bg-[var(--brand-soft)] text-[var(--brand)]"
                      : "text-foreground/70 hover:bg-[var(--surface-soft)] hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <form action="/admin/logout" method="post" className="border-t border-border p-3">
        <button
          type="submit"
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground/70 transition-colors hover:bg-[var(--surface-soft)] hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </form>
    </aside>
  );
}
