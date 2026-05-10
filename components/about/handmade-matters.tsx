import Image from "next/image";
import { Award, Hand, Eye, Leaf } from "lucide-react";

const points = [
  {
    icon: Award,
    title: "Quality over mass production",
    desc: "We'd rather make 30 beautiful pieces a month than 3,000 forgettable ones. Every piece earns its place in the studio.",
  },
  {
    icon: Hand,
    title: "Slow handmade craftsmanship",
    desc: "Crochet can't be rushed. Hours of looping go into a single bag — and you can feel that time in the finished piece.",
  },
  {
    icon: Eye,
    title: "Attention to every stitch",
    desc: "Even tension, neat finishing, careful color changes. The small details are what make a handmade piece feel premium.",
  },
  {
    icon: Leaf,
    title: "Sustainable creativity",
    desc: "Made-to-order means almost zero waste. We use ethically sourced yarn and recyclable, plastic-free packaging.",
  },
];

export function AboutHandmadeMatters() {
  return (
    <section className="bg-background py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-6">
            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl shadow-xl shadow-[var(--brand)]/10">
              <Image
                src="https://images.unsplash.com/photo-1605635543678-1cb6b29b40ec?w=900&h=1100&fit=crop"
                alt="Slow handmade crochet"
                fill
                sizes="(min-width: 1024px) 45vw, 100vw"
                className="object-cover"
              />
            </div>
          </div>

          <div className="lg:col-span-6">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand)]">
              Why Handmade Matters
            </span>
            <h2 className="font-heading mt-3 text-3xl text-foreground sm:text-4xl lg:text-5xl">
              Slow craft. Real care. Better pieces.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              In a world of fast fashion and disposable goods, we believe in
              going the other way — making fewer things, more carefully, and
              keeping them around for years.
            </p>

            <ul className="mt-8 space-y-4">
              {points.map(({ icon: Icon, title, desc }) => (
                <li
                  key={title}
                  className="flex items-start gap-4 rounded-2xl border border-border bg-[var(--surface-soft)] p-5 transition-colors hover:border-[var(--brand)]/40"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--brand)] text-white">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-base font-semibold text-foreground">
                      {title}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {desc}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
