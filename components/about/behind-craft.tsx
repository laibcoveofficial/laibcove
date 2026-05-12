import Image from "next/image";

const moments = [
  {
    src: "/babyitems.jpg",
    label: "The Craft",
    caption: "Hours of looping, one stitch at a time.",
    span: "lg:col-span-5 lg:row-span-2 aspect-[4/5]",
  },
  {
    src: "/ourstory2.png",
    label: "The Workspace",
    caption: "Sun, plants, yarn — our small studio in Karachi.",
    span: "lg:col-span-7 aspect-[3/2]",
  },
  {
    src: "/custom-flatlay.png",
    label: "The Materials",
    caption: "Soft cotton, ethically sourced wool, premium acrylic.",
    span: "lg:col-span-3 aspect-square",
  },
  {
    src: "/gajry6.jpeg",
    label: "The Yarn",
    caption: "Hundreds of colors, organized and waiting.",
    span: "lg:col-span-4 aspect-square",
  },
  {
    src: "/customorder.png",
    label: "The Finishing",
    caption: "Hand-tied ribbon and a card before it ships.",
    span: "lg:col-span-5 aspect-[5/4]",
  },
];

export function AboutBehindCraft() {
  return (
    <section className="bg-background py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand)]">
            Behind The Craft
          </span>
          <h2 className="font-heading mt-3 text-3xl text-foreground sm:text-4xl lg:text-5xl">
            A peek inside the studio
          </h2>
          <p className="mt-3 text-base text-muted-foreground">
            From the yarn shelf to the packing bench — here&apos;s the journey
            every Laibcove piece takes.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-12">
          {moments.map((m) => (
            <figure
              key={m.label}
              className={`group relative overflow-hidden rounded-3xl shadow-md ${m.span}`}
            >
              <Image
                src={m.src}
                alt={m.caption}
                fill
                sizes="(min-width: 1024px) 40vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <figcaption className="absolute inset-x-5 bottom-5 text-white">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/80">
                  {m.label}
                </p>
                <p className="font-heading mt-1 text-lg leading-snug">
                  {m.caption}
                </p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
