import { Heart, Award, Sparkles, Smile, Eye } from "lucide-react";

const values = [
  {
    icon: Heart,
    title: "Handmade with Love",
    desc: "Every piece carries the warmth of a human touch — not a machine.",
  },
  {
    icon: Award,
    title: "Quality Materials",
    desc: "Soft, durable, ethically sourced yarn and finishing that lasts.",
  },
  {
    icon: Sparkles,
    title: "Creativity",
    desc: "Bold ideas, custom requests, and one-of-a-kind designs welcome here.",
  },
  {
    icon: Smile,
    title: "Customer Happiness",
    desc: "Open communication, honest timelines, and a piece you'll genuinely love.",
  },
  {
    icon: Eye,
    title: "Attention to Detail",
    desc: "Tiny finishing touches we obsess over so you don't have to notice them.",
  },
];

export function AboutValues() {
  return (
    <section className="bg-[var(--surface-soft)] py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand)]">
            What We Stand For
          </span>
          <h2 className="font-heading mt-3 text-3xl text-foreground sm:text-4xl lg:text-5xl">
            The values stitched into every piece
          </h2>
          <p className="mt-3 text-base text-muted-foreground">
            Five quiet principles that shape everything we make and ship.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {values.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="group relative overflow-hidden rounded-3xl border border-border bg-background p-6 transition-all hover:-translate-y-1 hover:border-[var(--brand)]/30 hover:shadow-xl hover:shadow-[var(--brand)]/10"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full bg-[var(--brand-soft)] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              />
              <div className="relative">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--brand-soft)] text-[var(--brand)] transition-colors group-hover:bg-[var(--brand)] group-hover:text-white">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-heading mt-5 text-lg text-foreground">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
