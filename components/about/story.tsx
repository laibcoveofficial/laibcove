import Image from "next/image";
import { Heart, Sprout, Lightbulb, Sparkles } from "lucide-react";

const chapters = [
  {
    icon: Sprout,
    title: "It started in childhood",
    desc: "Tucked beside a grandmother who could turn a ball of yarn into magic, our founder learned that patience and small loops could create something beautiful.",
  },
  {
    icon: Heart,
    title: "A quiet love for handmade",
    desc: "What began as a hobby grew into a deep love for slow, intentional craft — a counterpoint to a world rushing past.",
  },
  {
    icon: Lightbulb,
    title: "An idea took shape",
    desc: "Friends kept asking for custom pieces. A bag here, a baby plushie there. Soon there was a small notebook full of ideas — and a brand was born.",
  },
  {
    icon: Sparkles,
    title: "Laibcove today",
    desc: "A studio of stitchers crafting one-of-a-kind pieces for customers around the world — every order made with the same care as that first.",
  },
];

export function AboutStory() {
  return (
    <section className="bg-background py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand)]">
              Our Story
            </span>
            <h2 className="font-heading mt-3 text-3xl text-foreground sm:text-4xl lg:text-5xl">
              From a single stitch to a small studio
            </h2>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground">
              Laibcove didn&apos;t start as a business. It started as a quiet
              afternoon habit — yarn, hooks, and the soft rhythm of looping.
              Years later, that same rhythm runs through every piece we make.
            </p>


          </div>

          <div className="lg:col-span-7">
            <ol className="relative space-y-12 border-l border-dashed border-[var(--brand)]/30 pl-14">
              {chapters.map(({ icon: Icon, title, desc }) => (
                <li key={title} className="relative">
                  <span className="absolute -left-[4.75rem] top-0 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--brand)] text-white shadow-md shadow-[var(--brand)]/25">
                    <Icon className="h-6 w-6" />
                  </span>
                  <h3 className="font-heading text-xl text-foreground">
                    {title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {desc}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
