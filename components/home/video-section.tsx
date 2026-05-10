import Image from "next/image";
import { Play, Sparkles } from "lucide-react";

const stats = [
  { value: "1,200+", label: "Pieces stitched" },
  { value: "180+", label: "Hours of craft this month" },
  { value: "27", label: "Countries shipped to" },
];

export function VideoSection() {
  return (
    <section className="relative overflow-hidden bg-foreground py-20 text-white sm:py-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,_rgba(23,182,208,0.25),_transparent_60%)]"
      />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
        {/* Video preview */}
        <div className="relative">
          <div className="relative aspect-video overflow-hidden rounded-3xl shadow-2xl">
            <Image
              src="https://images.unsplash.com/photo-1556909114-44e3e9399a2e?w=1200&h=700&fit=crop"
              alt="Behind the scenes — crochet craftsmanship"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/30" />

            <button
              type="button"
              aria-label="Play video"
              className="absolute inset-0 m-auto flex h-20 w-20 items-center justify-center"
            >
              <span
                aria-hidden
                className="absolute inset-0 rounded-full bg-[var(--brand)]/40 animate-ping"
              />
              <span className="relative flex h-20 w-20 items-center justify-center rounded-full bg-white text-[var(--brand)] shadow-2xl transition-transform hover:scale-110">
                <Play className="ml-1 h-8 w-8 fill-current" strokeWidth={0} />
              </span>
            </button>

            <div className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full bg-black/50 px-3 py-1.5 text-xs font-medium backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-[var(--brand)]" />
              Behind the loops · 2:14
            </div>
          </div>

          {/* Decorative ring */}
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-6 -right-6 h-32 w-32 rounded-full border-2 border-[var(--brand)]/30 lg:-bottom-10 lg:-right-10 lg:h-44 lg:w-44"
          />
        </div>

        {/* Copy + stats */}
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand)] backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" />
            Behind the scenes
          </span>
          <h2 className="font-heading mt-5 text-3xl leading-tight sm:text-4xl lg:text-5xl">
            See the{" "}
            <span className="italic text-[var(--brand)]">craftsmanship</span>{" "}
            up close
          </h2>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-white/70">
            From sketch to skein to finished piece — watch the slow, careful
            process behind every Laibcove order. No shortcuts, no machines, just
            patient hands and good yarn.
          </p>

          <dl className="mt-10 grid grid-cols-3 gap-4 border-t border-white/10 pt-8">
            {stats.map((s) => (
              <div key={s.label}>
                <dt className="font-heading text-3xl text-white sm:text-4xl">
                  {s.value}
                </dt>
                <dd className="mt-1 text-xs text-white/60">{s.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
