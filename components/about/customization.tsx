import Image from "next/image";
import Link from "next/link";
import { Palette, Ruler, Tag, ArrowRight } from "lucide-react";

const features = [
  {
    icon: Palette,
    title: "Choose your palette",
    desc: "Pick from our color library or send a swatch — we'll match it.",
  },
  {
    icon: Ruler,
    title: "Pick the size",
    desc: "Standard sizes or custom measurements. Tiny gift, oversized blanket — both welcome.",
  },
  {
    icon: Tag,
    title: "Add a personal touch",
    desc: "Embroidered names, initials, dates, or a tiny note tucked into the lining.",
  },
];

export function AboutCustomization() {
  return (
    <section className="bg-[var(--surface-soft)] py-20 sm:py-24">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-12 lg:gap-16 lg:px-8">
        <div className="relative lg:col-span-5">
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl shadow-xl shadow-[var(--brand)]/15">
            <Image
              src="https://images.unsplash.com/photo-1620207418302-439b387441b0?w=900&h=1100&fit=crop"
              alt="Customizing a crochet piece"
              fill
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="object-cover"
            />
          </div>
          <div className="absolute -bottom-5 left-6 right-6 rounded-2xl border border-border bg-white p-4 shadow-xl sm:left-auto sm:-right-4 sm:w-72">
            <p className="text-sm font-semibold text-foreground">
              Every order is one-of-a-kind
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              No two Laibcove pieces are ever exactly the same.
            </p>
          </div>
        </div>

        <div className="lg:col-span-7">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand)]">
            Customization
          </span>
          <h2 className="font-heading mt-3 text-3xl text-foreground sm:text-4xl lg:text-5xl">
            Made <span className="italic text-[var(--brand)]">uniquely</span>{" "}
            for you
          </h2>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
            Our brand is built on custom orders. Whether you have a clear
            vision or just a feeling, we&apos;ll work with you to design a
            piece that&apos;s genuinely yours — color, size, finish, all of it.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {features.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="rounded-2xl border border-border bg-background p-5 transition-all hover:-translate-y-0.5 hover:border-[var(--brand)]/40 hover:shadow-md hover:shadow-[var(--brand)]/10"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand)]">
                  <Icon className="h-5 w-5" />
                </span>
                <p className="mt-4 text-sm font-semibold text-foreground">
                  {title}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {desc}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <Link
              href="/contact"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-[var(--brand)] px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[var(--brand)]/25 transition-all hover:-translate-y-0.5"
            >
              Start Your Custom Order
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
