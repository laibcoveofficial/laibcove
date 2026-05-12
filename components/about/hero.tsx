import Image from "next/image";
import { Sparkles, Heart } from "lucide-react";

export function AboutHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[var(--brand-soft)] via-[var(--surface-soft)] to-background">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-[var(--brand)]/15 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-[var(--brand)]/10 blur-3xl"
      />

      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-12 lg:gap-16 lg:px-8 lg:py-24">
        <div className="lg:col-span-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--brand)]/30 bg-white/70 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-[var(--brand)] backdrop-blur">
            <Heart className="h-3.5 w-3.5" />
            Our Story
          </span>

          <h1 className="font-heading mt-6 text-4xl leading-[1.05] text-foreground sm:text-5xl lg:text-[60px]">
            Crafting Handmade Crochet
            <br />
            <span className="text-[var(--brand)]">with Love</span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Every stitch we create is carefully handcrafted to bring warmth,
            creativity, and personality into your life — one yarn loop at a
            time.
          </p>

          <div className="mt-10 grid max-w-md grid-cols-3 gap-6">
            <div>
              <p className="font-heading text-3xl text-[var(--brand)]">2,000+</p>
              <p className="mt-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Happy customers
              </p>
            </div>
            <div>
              <p className="font-heading text-3xl text-[var(--brand)]">100%</p>
              <p className="mt-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Handmade
              </p>
            </div>
            <div>
              <p className="font-heading text-3xl text-[var(--brand)]">5★</p>
              <p className="mt-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Customer rating
              </p>
            </div>
          </div>
        </div>

        <div className="relative lg:col-span-6">
          <div className="relative grid grid-cols-12 gap-3 sm:gap-4">
            <div className="col-span-7 row-span-2 aspect-[3/4] overflow-hidden rounded-3xl shadow-xl shadow-[var(--brand)]/15">
              <Image
                src="/ourstory2.png"
                alt="Founder crocheting"
                width={900}
                height={1200}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                priority
              />
            </div>
            <div className="col-span-5 aspect-square overflow-hidden rounded-3xl shadow-lg">
              <Image
                src="/gajry6.jpeg"
                alt="Crochet workspace"
                width={600}
                height={600}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>
            <div className="col-span-5 aspect-square overflow-hidden rounded-3xl shadow-lg">
              <Image
                src="/bag.webp"
                alt="Yarn collection"
                width={600}
                height={600}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>
          </div>

          <div className="absolute -bottom-6 -left-2 hidden items-center gap-3 rounded-2xl border border-border bg-white p-3 pr-5 shadow-xl sm:flex">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand)]">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="text-sm">
              <p className="font-semibold text-foreground">Made by hand</p>
              <p className="text-muted-foreground">In our small studio</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
