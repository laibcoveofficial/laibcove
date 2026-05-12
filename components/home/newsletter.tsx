import Image from "next/image";
import { Mail, Sparkles, ArrowRight } from "lucide-react";

import { MotionSection } from "@/components/ui/motion-section";

export function Newsletter() {
  return (
    <section className="bg-background py-20 sm:py-24">
      <MotionSection className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-[var(--brand-soft)]">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-[var(--brand)]/15 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-white/40 blur-3xl"
          />

          <div className="relative grid items-center gap-10 p-8 sm:p-12 lg:grid-cols-2 lg:gap-16 lg:p-16">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand)] backdrop-blur">
                <Sparkles className="h-3.5 w-3.5" />
                Get 10% off your first order
              </span>
              <h2 className="font-heading mt-5 text-3xl leading-tight text-foreground sm:text-4xl lg:text-5xl">
                Join our crochet{" "}
                <span className="text-[var(--brand)]">family</span>
              </h2>
              <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground">
                Get early access to new collections, exclusive discounts, and
                bite-sized crochet inspiration delivered straight to your inbox.
                No spam, ever.
              </p>

              <form className="mt-8 flex w-full max-w-md flex-col gap-3 sm:flex-row">
                <label htmlFor="newsletter-email" className="sr-only">
                  Email address
                </label>
                <div className="relative flex-1">
                  <Mail className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="newsletter-email"
                    type="email"
                    required
                    placeholder="Your email address"
                    className="h-12 w-full rounded-full border border-border bg-white pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-[var(--brand)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/30"
                  />
                </div>
                <button
                  type="submit"
                  className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[var(--brand)] px-6 text-sm font-semibold text-white shadow-lg shadow-[var(--brand)]/25 transition-all hover:-translate-y-0.5"
                >
                  Subscribe
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
              </form>
              <p className="mt-3 text-xs text-muted-foreground">
                By subscribing you agree to our privacy policy. Unsubscribe any
                time.
              </p>
            </div>

            <div className="relative hidden lg:block">
              <div className="relative ml-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-3xl shadow-xl">
                <Image
                  src="/flowers3.PNG"
                  alt="Crochet flatlay"
                  fill
                  sizes="(min-width: 1024px) 33vw, 100vw"
                  className="object-cover"
                />
              </div>
              <div className="absolute -top-5 -left-4 rounded-2xl border border-border bg-white px-4 py-3 shadow-xl">
                <p className="font-heading text-2xl text-[var(--brand)]">
                  10% OFF
                </p>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  Welcome gift
                </p>
              </div>
            </div>
          </div>
        </div>
      </MotionSection>
    </section>
  );
}
