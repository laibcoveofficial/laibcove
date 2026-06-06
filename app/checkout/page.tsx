import type { Metadata } from "next";
import { AnnouncementBar } from "@/components/site/announcement-bar";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { getPaymentAccounts } from "@/lib/payments/config";
import { listAvailableCoupons } from "@/lib/coupons/available";
import {
  DEFAULT_DELIVERY_PKR,
  DEFAULT_FREE_DELIVERY_THRESHOLD_PKR,
} from "@/lib/orders/delivery";

export const metadata: Metadata = {
  title: "Checkout — Laibcove",
  description:
    "Complete your order — secure checkout with JazzCash and EasyPaisa.",
};

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const accounts = getPaymentAccounts();
  const availableCoupons = await listAvailableCoupons();
  const delivery = Number(
    process.env.NEXT_PUBLIC_DELIVERY_PKR ?? DEFAULT_DELIVERY_PKR,
  );
  const freeDeliveryThreshold = Number(
    process.env.NEXT_PUBLIC_FREE_DELIVERY_THRESHOLD_PKR ??
      DEFAULT_FREE_DELIVERY_THRESHOLD_PKR,
  );

  return (
    <>
      <AnnouncementBar />
      <Header />
      <main className="flex flex-1 flex-col bg-[var(--surface-soft)] py-8 sm:py-12">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <CheckoutForm
            paymentAccounts={accounts.map((a) => ({
              method: a.method,
              accountNumber: a.accountNumber,
              accountTitle: a.accountTitle,
              instructions: a.instructions,
            }))}
            delivery={delivery}
            freeDeliveryThreshold={freeDeliveryThreshold}
            availableCoupons={availableCoupons}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
