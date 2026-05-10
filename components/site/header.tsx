import Image from "next/image";
import Link from "next/link";
import { Search, Heart, User, Menu } from "lucide-react";
import { CartIconButton } from "@/components/cart/cart-icon-button";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/70 bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:h-20 lg:px-8">
        {/* Mobile menu */}
        <button
          type="button"
          aria-label="Open menu"
          className="-ml-2 inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground/80 hover:bg-[var(--brand-soft)] hover:text-[var(--brand)] lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Logo */}
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2"
          aria-label="Laibcove home"
        >
          <Image
            src="/logo.png"
            alt="Laibcove"
            width={673}
            height={245}
            priority
            className="h-9 w-auto object-contain lg:h-11"
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-7 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="group relative inline-flex items-center gap-1 text-[13px] font-medium uppercase tracking-[0.08em] text-foreground/80 transition-colors hover:text-[var(--brand)]"
            >
              {link.label}
              <span className="absolute -bottom-1 left-1/2 h-0.5 w-0 -translate-x-1/2 rounded-full bg-[var(--brand)] transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </nav>

        {/* Right icons */}
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            type="button"
            aria-label="Search"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground/80 transition-colors hover:bg-[var(--brand-soft)] hover:text-[var(--brand)]"
          >
            <Search className="h-[18px] w-[18px]" />
          </button>
          <button
            type="button"
            aria-label="Wishlist"
            className="hidden h-10 w-10 items-center justify-center rounded-full text-foreground/80 transition-colors hover:bg-[var(--brand-soft)] hover:text-[var(--brand)] sm:inline-flex"
          >
            <Heart className="h-[18px] w-[18px]" />
          </button>
          <button
            type="button"
            aria-label="Account"
            className="hidden h-10 w-10 items-center justify-center rounded-full text-foreground/80 transition-colors hover:bg-[var(--brand-soft)] hover:text-[var(--brand)] sm:inline-flex"
          >
            <User className="h-[18px] w-[18px]" />
          </button>
          <CartIconButton />
        </div>
      </div>
    </header>
  );
}
