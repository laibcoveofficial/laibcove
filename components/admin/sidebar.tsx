"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingBag,
  LogOut,
  X,
} from "lucide-react";
import { useAdminUI } from "@/lib/admin/ui-context";

const links = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard, exact: true },
  { label: "Orders", href: "/admin/orders", icon: ShoppingBag },
  { label: "Leads", href: "/admin/leads", icon: Users },
  { label: "Products", href: "/admin/products", icon: Package },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, closeSidebar } = useAdminUI();

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");

  return (
    <>
      {/* Mobile backdrop */}
      <div
        aria-hidden={!sidebarOpen}
        onClick={closeSidebar}
        className={`fixed inset-0 z-40 bg-foreground/40 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          sidebarOpen
            ? "opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col border-r border-border bg-[var(--surface-soft)] transition-transform duration-300 ease-out lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
        aria-hidden={!sidebarOpen ? undefined : false}
      >
        <div className="flex h-16 items-center justify-between gap-2 border-b border-border px-6">
          <Image
            src="/logo.png"
            alt="Laibcove"
            width={673}
            height={245}
            className="h-8 w-auto object-contain"
          />
          <button
            type="button"
            onClick={closeSidebar}
            aria-label="Close menu"
            className="-mr-2 inline-flex h-9 w-9 items-center justify-center rounded-full text-foreground/70 transition-colors hover:bg-[var(--surface-soft)] lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-5">
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
    </>
  );
}
