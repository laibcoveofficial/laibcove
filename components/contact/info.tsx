import Link from "next/link";
import { Mail, Phone, Clock, MapPin } from "lucide-react";

const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" {...props}>
    <rect
      x="2.5"
      y="2.5"
      width="19"
      height="19"
      rx="5"
      stroke="currentColor"
      strokeWidth="1.6"
    />
    <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.6" />
    <circle cx="17.5" cy="6.5" r="1.1" fill="currentColor" />
  </svg>
);

const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.6.1-.2.3-.7.9-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6.1-.1.3-.3.4-.5.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5 0-.1-.6-1.5-.8-2.1-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.3-.9.9-.9 2.2 0 1.3.9 2.5 1 2.7.1.2 1.8 2.7 4.4 3.8 2.6 1 2.6.7 3 .7.5-.1 1.7-.7 1.9-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.3z" />
    <path d="M20.5 3.5C18.2 1.3 15.2 0 12 0 5.4 0 .1 5.3.1 11.9c0 2.1.5 4.2 1.6 6L0 24l6.3-1.6c1.7.9 3.7 1.4 5.7 1.4 6.6 0 11.9-5.3 11.9-11.9 0-3.2-1.2-6.2-3.4-8.4zM12 21.8c-1.8 0-3.6-.5-5.1-1.4l-.4-.2-3.7 1 1-3.6-.2-.4c-1-1.6-1.5-3.4-1.5-5.3C2.1 6.4 6.5 2 12 2c2.6 0 5.1 1 7 2.9 1.9 1.9 2.9 4.4 2.9 7-.1 5.5-4.5 9.9-9.9 9.9z" />
  </svg>
);

const TikTokIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43V8.62a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.84-.05z" />
  </svg>
);

const channels = [
  {
    Icon: Mail,
    label: "Email",
    value: "laibcove@gmail.com",
    href: "mailto:laibcove@gmail.com",
    note: "Best for detailed briefs & images",
  },
  {
    Icon: WhatsAppIcon,
    label: "WhatsApp",
    value: "0302-5787425",
    href: "https://wa.me/923025787425",
    note: "Fastest way to chat with us",
  },
  {
    Icon: InstagramIcon,
    label: "Instagram",
    value: "@laibcove",
    href: "https://www.instagram.com/laibcove?igsh=MTVhMnF6NmlvMXNv",
    note: "DMs welcome — see our latest work",
  },
  {
    Icon: TikTokIcon,
    label: "TikTok",
    value: "@laibcove",
    href: "https://www.tiktok.com/@laibcove?_r=1&_t=ZS-96C5mVsLtzR",
    note: "Behind-the-scenes & process videos",
  },
];

export function ContactInfo() {
  return (
    <section className="bg-[var(--brand-soft)] py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand)]">
              Get In Touch
            </span>
            <h2 className="font-heading mt-3 text-3xl text-foreground sm:text-4xl">
              Prefer to reach us directly?
            </h2>
            <p className="mt-3 text-base text-muted-foreground">
              Drop us a line on any of the channels below. We typically reply
              within 24 hours, often sooner.
            </p>

            <div className="mt-8 space-y-4 text-sm text-foreground">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[var(--brand)] shadow-sm">
                  <Clock className="h-4 w-4" />
                </span>
                <div>
                  <p className="font-semibold">Business Hours</p>
                  <p className="text-muted-foreground">
                    Mon – Sat · 10:00 AM – 7:00 PM (PKT)
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[var(--brand)] shadow-sm">
                  <MapPin className="h-4 w-4" />
                </span>
                <div>
                  <p className="font-semibold">Studio Location</p>
                  <p className="text-muted-foreground">
                    Karachi, Pakistan · Shipping worldwide
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[var(--brand)] shadow-sm">
                  <Phone className="h-4 w-4" />
                </span>
                <div>
                  <p className="font-semibold">Response Time</p>
                  <p className="text-muted-foreground">
                    We usually respond within 24 hours
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="grid gap-4 sm:grid-cols-2">
              {channels.map(({ Icon, label, value, href, note }) => (
                <Link
                  key={label}
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel={href.startsWith("http") ? "noreferrer" : undefined}
                  className="group flex items-start gap-4 rounded-2xl border border-white/70 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[var(--brand)]/15"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand)] transition-colors group-hover:bg-[var(--brand)] group-hover:text-white">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand)]">
                      {label}
                    </p>
                    <p className="mt-0.5 truncate text-sm font-semibold text-foreground">
                      {value}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {note}
                    </p>
                  </div>
                </Link>
              ))}

              <div className="rounded-2xl border border-dashed border-[var(--brand)]/40 bg-white/60 p-5 sm:col-span-2">
                <p className="text-sm font-semibold text-foreground">
                  Bulk or wholesale enquiries?
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Drop us an email at{" "}
                  <Link
                    href="mailto:wholesale@laibcove.com"
                    className="font-medium text-[var(--brand)] hover:underline"
                  >
                    wholesale@laibcove.com
                  </Link>{" "}
                  with quantity, deadline, and any reference images.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
