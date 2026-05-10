import {
  Heart,
  Award,
  Sparkles,
  Truck,
  ShieldCheck,
  Leaf,
} from "lucide-react";

const features = [
  {
    icon: Heart,
    title: "Handmade with Care",
    desc: "Every piece is stitched slowly, by hand — no mass production, ever.",
  },
  {
    icon: Award,
    title: "Premium Quality Yarn",
    desc: "We source ethically and choose softness, durability, and color that lasts.",
  },
  {
    icon: Sparkles,
    title: "Unique Designs",
    desc: "Limited runs and one-of-a-kind pieces you won't find anywhere else.",
  },
  {
    icon: Truck,
    title: "Worldwide Shipping",
    desc: "Carefully wrapped and shipped to your door — no matter where you are.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Payments",
    desc: "Encrypted checkout with all major cards, Apple Pay, and Google Pay.",
  },
  {
    icon: Leaf,
    title: "Eco-Friendly Packaging",
    desc: "Recyclable wrapping, plastic-free fillers, and a hand-tied ribbon finish.",
  },
];

export function WhyChooseUs() {
  return (
    <section className="bg-[var(--surface-soft)] py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand)]">
            The Laibcove Promise
          </span>
          <h2 className="font-heading mt-3 text-3xl text-foreground sm:text-4xl lg:text-5xl">
            Why customers love us
          </h2>
          <p className="mt-3 text-base text-muted-foreground">
            Six small things that make a big difference — and a thousand stitches
            that prove it.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="group relative overflow-hidden rounded-3xl border border-border bg-background p-7 transition-all hover:-translate-y-1 hover:border-[var(--brand)]/30 hover:shadow-xl hover:shadow-[var(--brand)]/10"
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
