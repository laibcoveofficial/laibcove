import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Heart, Award, Leaf } from "lucide-react";

import { MotionSection } from "@/components/ui/motion-section";

const stats = [
  { icon: Heart, value: "2k+", label: "Happy customers" },
  { icon: Award, value: "5★", label: "Average rating" },
  { icon: Leaf, value: "100%", label: "Eco-friendly yarn" },
];

export function AboutBrand() {
  return (
    <section className="bg-background py-20 sm:py-24">
      <MotionSection className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
        {/* Imagery */}
        <div className="relative">
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl shadow-xl shadow-[var(--brand)]/15">
            <Image
              src="/ourstory.png"
              alt="Founder crocheting at workspace"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
          <div className="absolute -bottom-6 -right-4 hidden aspect-square w-48 overflow-hidden rounded-3xl border-4 border-background shadow-xl sm:block">
            <Image
              src="/ourstory2.png"
              alt="Crochet workspace"
              width={400}
              height={400}
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        {/* Copy */}
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand)]">
            Our Story
          </span>
          <h2 className="font-heading mt-3 text-3xl leading-tight text-foreground sm:text-4xl lg:text-5xl">
            Made with passion and creativity
          </h2>
          <p className="mt-5 text-base leading-relaxed text-muted-foreground">
            At Laibcove, every stitch tells a story. What started as a quiet
            evening hobby grew into a small studio crafting heirloom-quality
            crochet pieces — bags, gajray, decor, and gifts that bring warmth
            and beauty into your everyday.
          </p>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            We use premium, ethically-sourced yarn and never rush a piece.
            Because the things you live with should feel as personal as the
            people who made them.
          </p>

          <div className="mt-8 grid grid-cols-3 gap-4">
            {stats.map(({ icon: Icon, value, label }) => (
              <div
                key={label}
                className="rounded-2xl border border-border bg-[var(--surface-soft)] p-4 text-center"
              >
                <Icon className="mx-auto h-5 w-5 text-[var(--brand)]" />
                <div className="font-heading mt-2 text-xl font-semibold text-foreground">
                  {value}
                </div>
                <div className="text-xs text-muted-foreground">{label}</div>
              </div>
            ))}
          </div>

          <Link
            href="/about"
            className="group mt-8 inline-flex items-center gap-2 rounded-full border border-foreground/20 px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:border-[var(--brand)] hover:text-[var(--brand)]"
          >
            Read Our Story
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </MotionSection>
    </section>
  );
}
