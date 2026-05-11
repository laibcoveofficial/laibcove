import Image from "next/image";
import Link from "next/link";
import { Sparkles, Palette, Tag, Gift, ArrowRight } from "lucide-react";

const features = [
  {
    icon: Palette,
    title: "Custom Colors",
    desc: "Pick your palette — match a nursery, wedding, or favorite outfit.",
  },
  {
    icon: Sparkles,
    title: "Custom Gajre & Bouquets",
    desc: "Personalized crochet gajre or forever bouquets for your special events.",
  },
  {
    icon: Tag,
    title: "Name Embroidery",
    desc: "Add a name or initials — perfect for newborns, weddings & gifts.",
  },
  {
    icon: Gift,
    title: "Gift Packaging",
    desc: "Hand-tied ribbon, custom card, and a gift-ready unboxing.",
  },
];

export function CustomOrders() {
  return (
    <section className="relative overflow-hidden bg-[var(--brand-soft)] py-20 sm:py-24">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-24 h-80 w-80 rounded-full bg-white/40 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-[var(--brand)]/15 blur-3xl"
      />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-12 lg:gap-16 lg:px-8">
        {/* Copy + features */}
        <div className="lg:col-span-7">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand)] backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" />
            Custom Orders Open
          </span>
          <h2 className="font-heading mt-5 text-3xl leading-tight text-foreground sm:text-4xl lg:text-5xl">
            Want something{" "}
            <span className="text-[var(--brand)]">made just for you</span>?
          </h2>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
            Tell us your idea. We&apos;ll work with you on every detail — color,
            size, finish — and stitch a piece that&apos;s yours alone.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {features.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="flex items-start gap-3 rounded-2xl border border-white/70 bg-white/70 p-4 backdrop-blur"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--brand)] text-white">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {title}
                  </p>
                  <p className="mt-0.5 text-[13px] leading-relaxed text-muted-foreground">
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/contact"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-[var(--brand)] px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[var(--brand)]/25 transition-all hover:-translate-y-0.5"
            >
              Request Custom Order
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/contact#examples"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-foreground/20 bg-white px-7 py-3.5 text-sm font-semibold text-foreground transition-colors hover:border-[var(--brand)] hover:text-[var(--brand)]"
            >
              See Past Commissions
            </Link>
          </div>
        </div>

        {/* Imagery */}
        <div className="relative lg:col-span-5">
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl shadow-xl shadow-[var(--brand)]/20">
            <Image
              src="https://images.unsplash.com/photo-1620207418302-439b387441b0?w=900&h=1100&fit=crop"
              alt="Custom crochet commission"
              fill
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="object-cover"
            />
          </div>

        </div>
      </div>
    </section>
  );
}
