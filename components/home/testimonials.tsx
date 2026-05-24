"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";

const testimonials = [
  {
    name: "Ayesha Khan",
    location: "Karachi, PK",
    rating: 5,
    quote:
      "Absolutely beautiful craftsmanship! The bag is even prettier in real life — every stitch perfect. I've already ordered two more as gifts.",
    productImage:
      "https://images.unsplash.com/photo-1591561954557-26941169b49e?w=300&h=300&fit=crop",
    productName: "Daisy Bloom Tote",
  },
  {
    name: "Parveen Akhtar",
    location: "Lahore, PK",
    rating: 5,
    quote:
      "I commissioned a custom gajray for my daughter's wedding and it was the highlight. You can feel the care that goes into every order.",
    productImage:
      "https://images.unsplash.com/photo-1535268647677-300dbf3d78d1?w=300&h=300&fit=crop",
    productName: "Custom Gajray",
  },
  {
    name: "Shahez",
    location: "Islamabad, PK",
    rating: 5,
    quote:
      "The packaging alone made me cry happy tears. The forever bouquet looks gorgeous on my dining table. Highly recommend!",
    productImage:
      "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=300&h=300&fit=crop",
    productName: "Rose Bouquet",
  },
  {
    name: "Zainab Bibi",
    location: "Rawalpindi, PK",
    rating: 5,
    quote:
      "Best crochet items in Pakistan! The quality of yarn is amazing and the colors are so vibrant. Will definitely buy again.",
    productImage:
      "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=300&h=300&fit=crop",
    productName: "Peach Clutch",
  },
];

import { MotionSection } from "@/components/ui/motion-section";

export function Testimonials() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: true,
    skipSnaps: false,
  });

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  return (
    <section className="relative overflow-hidden bg-[var(--brand-soft)] py-20 sm:py-24">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 h-96 w-[60%] -translate-x-1/2 rounded-full bg-white/40 blur-3xl"
      />

      <MotionSection className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-end justify-between gap-8 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand)]">
              Words from the loop
            </span>
            <h2 className="font-heading mt-3 text-3xl text-foreground sm:text-4xl lg:text-5xl">
              What our customers say
            </h2>
            <p className="mt-3 text-base text-muted-foreground">
              Real reviews from people who&apos;ve invited a little Laibcove into
              their homes.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={scrollPrev}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-white text-foreground shadow-sm transition-all hover:border-[var(--brand)] hover:text-[var(--brand)] active:scale-95"
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={scrollNext}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-white text-foreground shadow-sm transition-all hover:border-[var(--brand)] hover:text-[var(--brand)] active:scale-95"
              aria-label="Next slide"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="mt-14 overflow-hidden" ref={emblaRef}>
          <div className="flex gap-6">
            {testimonials.map((t, i) => (
              <figure
                key={i}
                className="relative flex min-w-0 flex-[0_0_100%] flex-col rounded-3xl bg-white p-7 shadow-sm ring-1 ring-border/60 sm:flex-[0_0_50%] lg:flex-[0_0_33.333%]"
              >
                <Quote
                  className="absolute -top-4 left-7 h-9 w-9 fill-[var(--brand)] text-[var(--brand)]"
                  strokeWidth={0}
                />

                <div className="flex items-center gap-1 text-[var(--brand)]">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Star
                      key={idx}
                      className={`h-4 w-4 ${idx < t.rating ? "fill-current" : "fill-muted text-muted-foreground/40"}`}
                      strokeWidth={0}
                    />
                  ))}
                </div>

                <blockquote className="font-heading mt-4 text-lg leading-relaxed text-foreground">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>

                <figcaption className="mt-6 flex items-center justify-between gap-3 border-t border-border pt-5">
                  <div className="text-sm">
                    <p className="font-semibold text-foreground">{t.name}</p>
                    <p className="text-muted-foreground">{t.location}</p>
                  </div>
                  <div className="flex items-center gap-2 rounded-xl bg-[var(--brand-soft)] py-1.5 pl-1.5 pr-3">
                    <div className="relative h-9 w-9 overflow-hidden rounded-lg">
                      <Image
                        src={t.productImage}
                        alt=""
                        fill
                        sizes="36px"
                        className="object-cover"
                      />
                    </div>
                    <span className="text-[11px] font-medium text-[var(--brand)]">
                      {t.productName}
                    </span>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </MotionSection>
    </section>
  );
}
