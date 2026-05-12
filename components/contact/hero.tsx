import Image from "next/image";
import { Sparkles, Heart } from "lucide-react";

export function ContactHero() {
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
        <div className="lg:col-span-7">
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--brand)]/30 bg-white/70 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-[var(--brand)] backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" />
            Custom Orders Open
          </span>

          <h1 className="font-heading mt-6 text-4xl leading-[1.05] text-foreground sm:text-5xl lg:text-[60px]">
            Let&apos;s Create Something{" "}
            <span className="text-[var(--brand)]">Beautiful Together</span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            We specialize in handmade crochet creations, crafted completely
            according to your style, color preferences, and custom requirements
            — every stitch made just for you.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-5">
            <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[var(--brand)] shadow-sm ring-1 ring-border">
                <Heart className="h-4 w-4" />
              </span>
              <span>
                <span className="font-semibold text-foreground">Replies in 24 hrs</span>
                <span className="block text-xs">Direct from our studio</span>
              </span>
            </div>
            <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[var(--brand)] shadow-sm ring-1 ring-border">
                <Sparkles className="h-4 w-4" />
              </span>
              <span>
                <span className="font-semibold text-foreground">Free design chat</span>
                <span className="block text-xs">No commitment to start</span>
              </span>
            </div>
          </div>
        </div>

        <div className="relative lg:col-span-5">
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl shadow-xl shadow-[var(--brand)]/20">
            <Image
              src="/customorder.png"
              alt="Handmade crochet custom order selection"
              fill
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              priority
            />
          </div>
          <div className="absolute -bottom-5 left-6 right-6 rounded-2xl border border-border bg-white p-4 shadow-xl sm:left-auto sm:-right-4 sm:w-72">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand)]">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="text-sm">
                <p className="font-semibold text-foreground">
                  Tell us your dream design
                </p>
                <p className="text-muted-foreground">
                  Sketches, references, ideas — all welcome
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
