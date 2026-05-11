import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";

const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" {...props}>
    <rect
      x="2.5"
      y="2.5"
      width="19"
      height="19"
      rx="5"
      stroke="currentColor"
      strokeWidth="1.6"
    />
    <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.6" />
    <circle cx="17.5" cy="6.5" r="1.1" fill="currentColor" />
  </svg>
);

const TikTokIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43V8.62a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.84-.05z" />
  </svg>
);

export const SOCIAL_LINKS = {
  instagram: "https://www.instagram.com/laibcove?igsh=MTVhMnF6NmlvMXNv",
  tiktok: "https://www.tiktok.com/@laibcove?_r=1&_t=ZS-96C5mVsLtzR",
};

const cols = [
  {
    heading: "Shop",
    links: [
      { label: "All Products", href: "/shop" },
      { label: "New Arrivals", href: "/shop?category=new-arrivals" },
      { label: "Best Sellers", href: "/shop?category=bestsellers" },
      { label: "Custom Orders", href: "/contact" },
    ],
  },
  {
    heading: "Information",
    links: [
      { label: "About Us", href: "/about" },
    ],
  },
  {
    heading: "Customer Service",
    links: [
      { label: "Contact Us", href: "/contact" },
      { label: "Track Order", href: "/orders" },
      { label: "Cart", href: "/cart" },
    ],
  },
];

const socials = [
  { Icon: InstagramIcon, href: SOCIAL_LINKS.instagram, label: "Instagram" },
  { Icon: TikTokIcon, href: SOCIAL_LINKS.tiktok, label: "TikTok" },
];

const payments = ["JazzCash", "EasyPaisa"];

export function Footer() {
  return (
    <footer className="border-t border-border bg-[var(--surface-soft)]">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:grid-cols-12">
          {/* Brand col */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-4">
            <Link href="/" className="inline-flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="Laibcove"
                width={673}
                height={245}
                className="h-10 w-auto object-contain"
              />
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Handmade crochet creations — bags, plushies, decor, and gifts —
              stitched slowly and shipped worldwide from our small studio.
            </p>

            <ul className="mt-6 space-y-2.5 text-sm text-muted-foreground">
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[var(--brand)]" />
                Wah Cantt, Punjab, Pakistan
              </li>
              <li className="flex items-start gap-2.5">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-[var(--brand)]" />
                <a
                  href="mailto:laibcove@gmail.com"
                  className="hover:text-[var(--brand)]"
                >
                  laibcove@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-[var(--brand)]" />
                <a
                  href="https://wa.me/923025787425"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[var(--brand)]"
                >
                  0302-5787425
                </a>
              </li>
            </ul>
          </div>

          {cols.map((col) => (
            <div key={col.heading} className="lg:col-span-2">
              <h4 className="text-sm font-semibold uppercase tracking-[0.12em] text-foreground">
                {col.heading}
              </h4>
              <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="transition-colors hover:text-[var(--brand)]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Social */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-2">
            <h4 className="text-sm font-semibold uppercase tracking-[0.12em] text-foreground">
              Follow
            </h4>
            <div className="mt-5 flex flex-wrap gap-2.5">
              {socials.map(({ Icon, href, label }) => (
                <Link
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-foreground/70 transition-colors hover:border-[var(--brand)] hover:bg-[var(--brand)] hover:text-white"
                >
                  <Icon className="h-4 w-4" />
                </Link>
              ))}
            </div>
            <p className="mt-5 text-xs leading-relaxed text-muted-foreground">
              Tag <span className="font-medium text-foreground">#laibcoveloops</span>{" "}
              on your socials and we&apos;ll feature you.
            </p>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-6 border-t border-border pt-8 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Laibcove. All rights reserved. Made with
            love &amp; yarn.
          </p>
        </div>
      </div>
    </footer>
  );
}
