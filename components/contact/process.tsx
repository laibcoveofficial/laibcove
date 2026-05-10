import {
  PenLine,
  MessagesSquare,
  ClipboardCheck,
  Scissors,
  PackageCheck,
} from "lucide-react";

const steps = [
  {
    icon: PenLine,
    title: "Submit Your Idea",
    desc: "Share your vision through the form — references, colors, sizes, deadlines.",
  },
  {
    icon: MessagesSquare,
    title: "We Discuss Details",
    desc: "We reach out within 24 hrs to refine your concept and answer questions.",
  },
  {
    icon: ClipboardCheck,
    title: "Design & Pricing",
    desc: "You approve the final mockup, materials, timeline, and quote in PKR.",
  },
  {
    icon: Scissors,
    title: "Handcrafting Begins",
    desc: "Every stitch is made by hand in our studio — typically 2–4 weeks.",
  },
  {
    icon: PackageCheck,
    title: "Delivered to You",
    desc: "Wrapped with care and shipped to your doorstep, anywhere.",
  },
];

export function ContactProcess() {
  return (
    <section className="bg-[var(--surface-soft)] py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand)]">
            Our Process
          </span>
          <h2 className="font-heading mt-3 text-3xl text-foreground sm:text-4xl lg:text-5xl">
            How custom orders work
          </h2>
          <p className="mt-3 text-base text-muted-foreground">
            From a spark of an idea to a finished piece in your hands —
            here&apos;s exactly what to expect.
          </p>
        </div>

        <div className="relative mt-14">
          <div
            aria-hidden
            className="absolute left-0 right-0 top-7 hidden h-px bg-gradient-to-r from-transparent via-[var(--brand)]/30 to-transparent lg:block"
          />
          <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {steps.map(({ icon: Icon, title, desc }, i) => (
              <li
                key={title}
                className="relative rounded-3xl border border-border bg-background p-6 transition-all hover:-translate-y-1 hover:border-[var(--brand)]/30 hover:shadow-lg hover:shadow-[var(--brand)]/10"
              >
                <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--brand)] text-white shadow-md shadow-[var(--brand)]/25">
                  <Icon className="h-6 w-6" />
                  <span className="absolute -top-2 -right-2 inline-flex h-6 w-6 items-center justify-center rounded-full border-2 border-[var(--surface-soft)] bg-white text-[11px] font-bold text-[var(--brand)] shadow">
                    {i + 1}
                  </span>
                </div>
                <h3 className="font-heading mt-5 text-lg text-foreground">
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
    </section>
  );
}
