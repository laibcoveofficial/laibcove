import type { Metadata } from "next";
import { AnnouncementBar } from "@/components/site/announcement-bar";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { CartView } from "@/components/cart/cart-view";

export const metadata: Metadata = {
  title: "Your Cart — Laibcove",
  description: "Review your handmade crochet picks before checkout.",
};

export default function CartPage() {
  return (
    <>
      <AnnouncementBar />
      <Header />
      <main className="flex flex-1 flex-col bg-[var(--surface-soft)] py-10 sm:py-14">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <header className="mb-8 text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--brand)]/30 bg-white/70 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-[var(--brand)] backdrop-blur">
              Your Cart
            </span>
            <h1 className="font-heading mt-4 text-3xl text-foreground sm:text-4xl lg:text-5xl">
              Almost Yours
            </h1>
            <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
              Review your handmade picks. Adjust quantities or remove items
              before continuing to checkout.
            </p>
          </header>
          <CartView />
        </div>
      </main>
      <Footer />
    </>
  );
}
