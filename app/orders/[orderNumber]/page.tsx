import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Check,
  Clock,
  Package,
  Truck,
  PartyPopper,
  XCircle,
  CreditCard,
} from "lucide-react";
import { AnnouncementBar } from "@/components/site/announcement-bar";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { getSupabase } from "@/lib/supabase/server";
import {
  formatPKR,
  ORDER_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
  type Order,
  type OrderItem,
  type OrderStatus,
  type PaymentStatus,
} from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}): Promise<Metadata> {
  const { orderNumber } = await params;
  return {
    title: `Order ${orderNumber} — Laibcove`,
    description: "Track your handmade order status.",
    robots: { index: false, follow: false },
  };
}

async function loadOrder(orderNumber: string): Promise<{
  order: Order;
  items: OrderItem[];
} | null> {
  try {
    const supabase = getSupabase();
    const { data: order } = await supabase
      .from("orders")
      .select("*")
      .eq("order_number", orderNumber)
      .maybeSingle();
    if (!order) return null;
    const { data: items } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", (order as Order).id)
      .order("created_at", { ascending: true });
    return { order: order as Order, items: (items ?? []) as OrderItem[] };
  } catch {
    return null;
  }
}

const TIMELINE: { key: OrderStatus; label: string; Icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "pending", label: "Order placed", Icon: Clock },
  { key: "confirmed", label: "Payment confirmed", Icon: Check },
  { key: "processing", label: "Crafting", Icon: Package },
  { key: "shipped", label: "Shipped", Icon: Truck },
  { key: "delivered", label: "Delivered", Icon: PartyPopper },
];

function statusIndex(status: OrderStatus): number {
  if (status === "cancelled") return -1;
  return TIMELINE.findIndex((t) => t.key === status);
}

const PAYMENT_TONE: Record<PaymentStatus, string> = {
  pending: "bg-amber-50 text-amber-800 border-amber-200",
  paid: "bg-emerald-50 text-emerald-800 border-emerald-200",
  failed: "bg-red-50 text-red-800 border-red-200",
  refunded: "bg-gray-100 text-gray-700 border-gray-200",
};

export default async function OrderTrackingPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  const data = await loadOrder(orderNumber);
  if (!data) notFound();
  const { order, items } = data;

  const activeIdx = statusIndex(order.order_status);
  const isCancelled = order.order_status === "cancelled";

  return (
    <>
      <AnnouncementBar />
      <Header />
      <main className="flex flex-1 flex-col bg-[var(--surface-soft)] py-10 sm:py-14">
        <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8">
          <header className="mb-8 text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--brand)]/30 bg-white/70 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-[var(--brand)] backdrop-blur">
              Order Tracking
            </span>
            <h1 className="font-heading mt-4 text-3xl text-foreground sm:text-4xl lg:text-5xl">
              {order.order_number}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Placed{" "}
              {new Date(order.created_at).toLocaleDateString("en-PK", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </header>

          {/* Status banner */}
          <div className="rounded-3xl border border-border bg-background p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Status
                </p>
                <p className="font-heading mt-1 text-2xl text-foreground">
                  {ORDER_STATUS_LABELS[order.order_status]}
                </p>
              </div>
              <div
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold ${PAYMENT_TONE[order.payment_status]}`}
              >
                <CreditCard className="h-3.5 w-3.5" />
                {PAYMENT_METHOD_LABELS[order.payment_method]} ·{" "}
                {PAYMENT_STATUS_LABELS[order.payment_status]}
              </div>
            </div>

            {/* Timeline */}
            {isCancelled ? (
              <div className="mt-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                <XCircle className="h-5 w-5" />
                This order has been cancelled. Please reach out if you have
                questions.
              </div>
            ) : (
              <ol className="mt-7 grid gap-4 sm:grid-cols-5">
                {TIMELINE.map((t, i) => {
                  const done = i <= activeIdx;
                  const current = i === activeIdx;
                  const { Icon } = t;
                  return (
                    <li key={t.key} className="flex flex-col items-center text-center">
                      <span
                        className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
                          done
                            ? "border-[var(--brand)] bg-[var(--brand)] text-white"
                            : current
                              ? "border-[var(--brand)] bg-white text-[var(--brand)]"
                              : "border-border bg-white text-muted-foreground"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <span
                        className={`mt-2 text-xs font-semibold ${
                          done || current ? "text-foreground" : "text-muted-foreground"
                        }`}
                      >
                        {t.label}
                      </span>
                    </li>
                  );
                })}
              </ol>
            )}

            {order.payment_status === "pending" ? (
              <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                <p className="font-semibold">Payment pending</p>
                <p className="mt-1 text-amber-800/90">
                  Please send {formatPKR(order.total_pkr)} via{" "}
                  {PAYMENT_METHOD_LABELS[order.payment_method]} if you haven't
                  yet. Once we verify your payment, we'll mark this order as
                  confirmed and start crafting.
                </p>
              </div>
            ) : null}
          </div>

          {/* Items */}
          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
            <div className="rounded-3xl border border-border bg-background p-6 shadow-sm">
              <h2 className="font-heading text-lg text-foreground">Items</h2>
              <ul className="mt-4 divide-y divide-border">
                {items.map((it) => (
                  <li key={it.id} className="flex gap-3 py-3">
                    {it.product_image ? (
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[var(--surface-soft)]">
                        <Image
                          src={it.product_image}
                          alt=""
                          fill
                          sizes="64px"
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    ) : (
                      <div className="h-16 w-16 shrink-0 rounded-xl bg-[var(--surface-soft)]" />
                    )}
                    <div className="min-w-0 flex-1">
                      {it.product_slug ? (
                        <Link
                          href={`/shop/${it.product_slug}`}
                          className="text-sm font-semibold text-foreground hover:text-[var(--brand)]"
                        >
                          {it.product_name}
                        </Link>
                      ) : (
                        <p className="text-sm font-semibold text-foreground">
                          {it.product_name}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Qty {it.quantity} × {formatPKR(it.unit_price_pkr)}
                      </p>
                    </div>
                    <p className="shrink-0 text-sm font-semibold text-foreground">
                      {formatPKR(it.line_total_pkr)}
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            <aside className="space-y-4">
              <div className="rounded-3xl border border-border bg-background p-6 shadow-sm">
                <h3 className="font-heading text-lg text-foreground">
                  Summary
                </h3>
                <dl className="mt-4 space-y-2 text-sm">
                  <Row label="Subtotal" value={formatPKR(order.subtotal_pkr)} />
                  <Row
                    label="Delivery"
                    value={
                      order.delivery_pkr === 0
                        ? "Free"
                        : formatPKR(order.delivery_pkr)
                    }
                  />
                  {order.discount_pkr > 0 ? (
                    <Row
                      label={`Discount${order.coupon_code ? ` (${order.coupon_code})` : ""}`}
                      value={`−${formatPKR(order.discount_pkr)}`}
                      tone="emerald"
                    />
                  ) : null}
                  <div className="flex items-center justify-between border-t border-border pt-2 text-base font-semibold text-foreground">
                    <dt>Total</dt>
                    <dd className="font-heading text-lg">
                      {formatPKR(order.total_pkr)}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="rounded-3xl border border-border bg-background p-6 shadow-sm">
                <h3 className="font-heading text-lg text-foreground">
                  Shipping to
                </h3>
                <p className="mt-2 text-sm text-foreground/85">
                  {order.customer_name}
                  <br />
                  {order.shipping_address}
                  <br />
                  {order.city}
                  {order.postal_code ? `, ${order.postal_code}` : ""}
                  <br />
                  {order.customer_phone}
                </p>
              </div>
            </aside>
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/shop"
              className="text-sm font-medium text-foreground/70 hover:text-[var(--brand)]"
            >
              ← Back to shop
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

function Row({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "emerald";
}) {
  return (
    <div className="flex items-center justify-between text-foreground/85">
      <dt>{label}</dt>
      <dd
        className={`font-medium ${tone === "emerald" ? "text-emerald-700" : ""}`}
      >
        {value}
      </dd>
    </div>
  );
}
