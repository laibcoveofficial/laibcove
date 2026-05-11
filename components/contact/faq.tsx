"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";

const faqs = [
  {
    q: "How long does a custom order take?",
    a: "Most custom pieces take 2–4 weeks from design approval to delivery. Larger items or bulk orders can take 4–6 weeks. We'll always confirm your timeline before starting.",
  },
  {
    q: "Can I request my own design?",
    a: "Absolutely — that's our favorite kind of order. Send us sketches, photos, Pinterest boards, or just a description, and we'll work with you to bring it to life.",
  },
  {
    q: "Do you ship internationally?",
    a: "Yes, we ship worldwide. Local delivery within Pakistan is fastest (3–5 days). International shipping typically takes 7–14 business days depending on your country.",
  },
  {
    q: "Can I choose custom colors?",
    a: "Of course. Pick from our color palette in the form, or share a specific shade or photo and we'll match it as closely as our yarn selection allows.",
  },
  {
    q: "Do you accept bulk orders?",
    a: "Yes. We love working with brands, event planners, and small businesses. Email wholesale@laibcove.com or mention bulk in the form for special pricing.",
  },
  {
    q: "How does pricing work?",
    a: "Pricing depends on size, complexity, materials, and quantity. After you submit your request, we'll send a detailed quote in PKR — no surprises, no hidden fees.",
  },
  {
    q: "Can I modify my order later?",
    a: "Small tweaks (colors, custom text) are easy to accommodate before crafting begins. Once we've started stitching, larger changes may affect timeline or pricing.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept bank transfer, JazzCash, EasyPaisa, and major cards through our secure checkout. International orders can also pay via PayPal or Wise.",
  },
];

export function ContactFAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="bg-background py-20 sm:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand)]">
            Frequently Asked
          </span>
          <h2 className="font-heading mt-3 text-3xl text-foreground sm:text-4xl lg:text-5xl">
            Questions, answered
          </h2>
          <p className="mt-3 text-base text-muted-foreground">
            Can&apos;t find what you&apos;re looking for? Send us a message and
            we&apos;ll get back to you.
          </p>
        </div>

        <ul className="mt-12 space-y-3">
          {faqs.map((faq, i) => {
            const isOpen = open === i;
            return (
              <li
                key={faq.q}
                className={`overflow-hidden rounded-2xl border bg-[var(--surface-soft)] transition-colors ${
                  isOpen ? "border-[var(--brand)]/40" : "border-border"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className="text-base font-semibold text-foreground">
                    {faq.q}
                  </span>
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors ${
                      isOpen
                        ? "bg-[var(--brand)] text-white"
                        : "bg-white text-[var(--brand)]"
                    }`}
                  >
                    {isOpen ? (
                      <Minus className="h-4 w-4" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                  </span>
                </button>
                <div
                  className={`grid transition-all duration-300 ease-out ${
                    isOpen
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">
                      {faq.a}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
