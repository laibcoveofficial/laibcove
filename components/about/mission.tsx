import { Quote } from "lucide-react";

export function AboutMission() {
  return (
    <section className="relative overflow-hidden bg-[var(--brand-soft)] py-20 sm:py-24">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 h-96 w-[60%] -translate-x-1/2 rounded-full bg-white/40 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-[var(--brand)]/15 blur-3xl"
      />

      <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand)]">
          Our Mission
        </span>

        <div className="mx-auto mt-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-[var(--brand)] shadow-lg shadow-[var(--brand)]/15">
          <Quote className="h-7 w-7 fill-current" strokeWidth={0} />
        </div>

        <p className="font-heading mt-8 text-2xl leading-relaxed text-foreground sm:text-3xl lg:text-4xl">
          To create meaningful handmade crochet pieces that are{" "}
          <span className="italic text-[var(--brand)]">unique, personal,</span>{" "}
          and crafted with care for every customer.
        </p>

        <p className="mt-8 text-base text-muted-foreground">
          We believe that what you wear, gift, and surround yourself with
          should carry intention. Slow craft is our way of putting that
          intention into the world.
        </p>
      </div>
    </section>
  );
}
