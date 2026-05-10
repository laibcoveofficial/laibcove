import type { Metadata } from "next";
import { Search } from "lucide-react";
import { redirect } from "next/navigation";
import { AnnouncementBar } from "@/components/site/announcement-bar";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";

export const metadata: Metadata = {
  title: "Track Your Order — Laibcove",
};

async function findOrder(formData: FormData) {
  "use server";
  const raw = String(formData.get("order_number") || "")
    .trim()
    .toUpperCase();
  if (!raw) return;
  // Allow either "LCV-XXXXXX" or just "XXXXXX"
  const orderNumber = raw.startsWith("LCV-") ? raw : `LCV-${raw}`;
  redirect(`/orders/${orderNumber}`);
}

export default function OrdersLookupPage() {
  return (
    <>
      <AnnouncementBar />
      <Header />
      <main className="flex flex-1 flex-col bg-[var(--surface-soft)] py-14 sm:py-20">
        <div className="mx-auto w-full max-w-md px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-border bg-background p-8 shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--brand-soft)] text-[var(--brand)]">
              <Search className="h-6 w-6" />
            </div>
            <h1 className="font-heading mt-5 text-center text-2xl text-foreground sm:text-3xl">
              Track Your Order
            </h1>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              Enter the order number we sent to your email.
            </p>
            <form action={findOrder} className="mt-6">
              <input
                type="text"
                name="order_number"
                required
                placeholder="LCV-A8K2D9"
                className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-center text-base font-semibold uppercase tracking-[0.18em] outline-none placeholder:text-muted-foreground focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/20"
              />
              <button
                type="submit"
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--brand)] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[var(--brand)]/25 transition-all hover:-translate-y-0.5"
              >
                Find my order
              </button>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
