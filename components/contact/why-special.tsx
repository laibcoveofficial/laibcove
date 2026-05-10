import { Heart, Palette, Award, Sparkles, Gem, Hand } from "lucide-react";

const reasons = [
  {
    icon: Hand,
    title: "Fully Handmade",
    desc: "Every stitch is made by hand. No factories, no shortcuts — just craft.",
  },
  {
    icon: Palette,
    title: "Personalized Designs",
    desc: "Pick your colors, size, materials, and details. It's yours alone.",
  },
  {
    icon: Award,
    title: "Premium Quality Yarn",
    desc: "We source soft, durable yarn that holds its color and shape for years.",
  },
  {
    icon: Sparkles,
    title: "Attention to Detail",
    desc: "Embroidery, finishing, packaging — we sweat the small stuff.",
  },
  {
    icon: Gem,
    title: "One-of-a-Kind",
    desc: "No two pieces are identical. Yours is genuinely unique.",
  },
  {
    icon: Heart,
    title: "Made with Love",
    desc: "Slow craft, warm hands, real care. You'll feel it in the finished piece.",
  },
];

export function ContactWhySpecial() {
  return (
    <section className="bg-background py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand)]">
            Why Custom Crochet
          </span>
          <h2 className="font-heading mt-3 text-3xl text-foreground sm:text-4xl lg:text-5xl">
            Why our handmade creations are special
          </h2>
          <p className="mt-3 text-base text-muted-foreground">
            Choosing custom means choosing quality, intention, and a piece
            that&apos;s genuinely yours.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {reasons.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="group relative overflow-hidden rounded-3xl border border-border bg-[var(--surface-soft)] p-7 transition-all hover:-translate-y-1 hover:border-[var(--brand)]/30 hover:shadow-xl hover:shadow-[var(--brand)]/10"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full bg-[var(--brand-soft)] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              />
              <div className="relative">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--brand-soft)] text-[var(--brand)] transition-colors group-hover:bg-[var(--brand)] group-hover:text-white">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-heading mt-5 text-xl text-foreground">
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
