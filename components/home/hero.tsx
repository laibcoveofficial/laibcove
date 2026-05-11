import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles, Star } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[var(--brand-soft)] via-[var(--surface-soft)] to-background">
      {/* Decorative blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-[var(--brand)]/15 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-[var(--brand)]/10 blur-3xl"
      />

      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-12 lg:gap-16 lg:px-8 lg:py-24">
        {/* Copy */}
        <div className="lg:col-span-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--brand)]/30 bg-white/70 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-[var(--brand)] backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" />
            New Summer Collection
          </span>

          <h1 className="font-heading mt-6 text-4xl leading-[1.05] text-foreground sm:text-5xl lg:text-[64px]">
            Handmade Crochet
            <br />
            <span className="text-[var(--brand)]">Crafted with Love</span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Discover beautifully handcrafted crochet bags, plushies, and home
            decor — made from premium yarn with attention to every single
            stitch.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/shop"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-[var(--brand)] px-7 py-3.5 text-sm font-semibold tracking-wide text-white shadow-lg shadow-[var(--brand)]/25 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[var(--brand)]/30"
            >
              Shop Now
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/collection"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-foreground/20 bg-white/70 px-7 py-3.5 text-sm font-semibold tracking-wide text-foreground backdrop-blur transition-all hover:border-[var(--brand)] hover:text-[var(--brand)]"
            >
              Explore Collection
            </Link>
          </div>

          {/* Social proof */}
          <div className="mt-10 flex items-center gap-6">
            <div className="flex -space-x-3">
              {[
                "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop",
                "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop",
                "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop",
                "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80&h=80&fit=crop",
              ].map((src, i) => (
                <div
                  key={i}
                  className="relative h-10 w-10 overflow-hidden rounded-full border-2 border-white shadow-sm"
                >
                  <Image
                    src={src}
                    alt=""
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
            <div className="text-sm">
              <div className="flex items-center gap-1 text-[var(--brand)]">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-current"
                    strokeWidth={0}
                  />
                ))}
                <span className="ml-1 font-semibold text-foreground">4.9</span>
              </div>
              <p className="text-muted-foreground">Loved by 2,000+ customers</p>
            </div>
          </div>
        </div>

        {/* Imagery */}
        <div className="relative lg:col-span-6">
          <div className="relative grid grid-cols-12 gap-3 sm:gap-4">
            <div className="col-span-7 row-span-2 aspect-[3/4] overflow-hidden rounded-3xl shadow-xl shadow-[var(--brand)]/15">
              <Image
                src="https://images.unsplash.com/photo-1620207418302-439b387441b0?w=900&h=1200&fit=crop"
                alt="Handmade crochet bag"
                width={900}
                height={1200}
                className="h-full w-full object-cover"
                priority
              />
            </div>
            <div className="col-span-5 aspect-square overflow-hidden rounded-3xl shadow-lg">
              <Image
                src="https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=600&h=600&fit=crop"
                alt="Crochet flowers"
                width={600}
                height={600}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="col-span-5 aspect-square overflow-hidden rounded-3xl shadow-lg">
              <Image
                src="https://images.unsplash.com/photo-1605635543678-1cb6b29b40ec?w=600&h=600&fit=crop"
                alt="Crochet plushie"
                width={600}
                height={600}
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          {/* Floating card */}
          <div className="absolute -bottom-6 -left-2 hidden items-center gap-3 rounded-2xl border border-border bg-white p-3 pr-5 shadow-xl sm:flex">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand)]">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="text-sm">
              <p className="font-semibold text-foreground">100% Handmade</p>
              <p className="text-muted-foreground">Premium quality yarn</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
