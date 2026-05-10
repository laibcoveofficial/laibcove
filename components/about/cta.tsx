import Link from "next/link";
import { ArrowRight, MessageCircle, Sparkles } from "lucide-react";

export function AboutCTA() {
  return (
    <section className="bg-background py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-[var(--brand)] px-6 py-14 text-center shadow-xl shadow-[var(--brand)]/25 sm:px-10 sm:py-20">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-white/15 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-white/10 blur-3xl"
          />

          <div className="relative mx-auto max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-white backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" />
              Custom Orders Open
            </span>

            <h2 className="font-heading mt-6 text-3xl leading-tight text-white sm:text-4xl lg:text-5xl">
              Ready to create your custom crochet piece?
            </h2>
            <p className="mt-4 text-base leading-relaxed text-white/85 sm:text-lg">
              Tell us your idea and we&apos;ll bring it to life — color by
              color, stitch by stitch.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/contact"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-[var(--brand)] shadow-lg transition-all hover:-translate-y-0.5"
              >
                Start Custom Order
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/contact#request-form"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/40 bg-white/10 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur transition-colors hover:bg-white/20"
              >
                <MessageCircle className="h-4 w-4" />
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
