import Image from "next/image";
import Link from "next/link";

const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <rect
      x="2.5"
      y="2.5"
      width="19"
      height="19"
      rx="5"
      stroke="currentColor"
      strokeWidth="1.6"
    />
    <circle
      cx="12"
      cy="12"
      r="4.2"
      stroke="currentColor"
      strokeWidth="1.6"
    />
    <circle cx="17.5" cy="6.5" r="1.1" fill="currentColor" />
  </svg>
);

const posts = [
  { image: "/gajry2.PNG", likes: "2.1k" },
  { image: "/baby.jpeg", likes: "1.4k" },
  { image: "/flowerpot.jpeg", likes: "983" },
  { image: "/mc.jpg", likes: "1.7k" },
  { image: "/bag.jpeg", likes: "722" },
  { image: "/gajry3.jpeg", likes: "2.4k" },
];

import { MotionSection } from "@/components/ui/motion-section";

export function InstagramGallery() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-24">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/back.jpg"
          alt=""
          fill
          className="object-cover opacity-10"
          priority
        />
        <div className="absolute inset-0 bg-background/80" />
      </div>
      <MotionSection className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand)]">
            <span className="inline-flex items-center gap-2">
              <InstagramIcon className="h-3.5 w-3.5" />
              @laibcove
            </span>
          </span>
          <h2 className="font-heading mt-3 text-3xl text-foreground sm:text-4xl lg:text-5xl">
            From our crochet community
          </h2>
          <p className="mt-3 text-base text-muted-foreground">
            Tag <span className="font-medium text-foreground">#laibcoveloops</span>{" "}
            to be featured in our gallery.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3 lg:grid-cols-6">
          {posts.map((post, i) => (
            <Link
              key={i}
              href="https://www.instagram.com/laibcove?igsh=MTVhMnF6NmlvMXNv"
              target="_blank"
              rel="noreferrer"
              className="group relative block aspect-square overflow-hidden rounded-2xl"
            >
              <Image
                src={post.image}
                alt=""
                fill
                sizes="(min-width: 1024px) 16vw, (min-width: 768px) 33vw, 50vw"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-[var(--brand)]/85 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <div className="flex flex-col items-center gap-1 text-white">
                  <InstagramIcon className="h-6 w-6" />
                  <span className="text-xs font-semibold">♥ {post.likes}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <Link
            href="https://www.instagram.com/laibcove?igsh=MTVhMnF6NmlvMXNv"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-foreground/20 px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:border-[var(--brand)] hover:text-[var(--brand)]"
          >
            <InstagramIcon className="h-4 w-4" />
            Follow @laibcove
          </Link>
        </div>
      </MotionSection>
    </section>
  );
}
