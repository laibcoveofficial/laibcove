import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  Home,
  Mail,
  Package,
  Search,
} from "lucide-react";
import { AnnouncementBar } from "@/components/site/announcement-bar";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { SuccessAnimation } from "@/components/checkout/success-animation";
import { getSupabase } from "@/lib/supabase/server";
import {
  formatPKR,
  PAYMENT_METHOD_LABELS,
  type Order,
  type OrderItem,
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
    description: "Your handmade order has been received.",
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

export default async function SuccessPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  const data = await loadOrder(orderNumber);
  if (!data) notFound();
  const { order, items } = data;

  return (
    <>
      <AnnouncementBar />
      <Header />
      <main className="flex flex-1 flex-col bg-gradient-to-b from-[var(--brand-soft)] via-[var(--surface-soft)] to-background py-12 sm:py-16">
        <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8">
          <SuccessAnimation />

          <div className="mt-8 text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--brand)]/30 bg-white/70 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-[var(--brand)] backdrop-blur">
              Order placed
            </span>
            <h1 className="font-heading mt-4 text-4xl text-foreground sm:text-5xl">
              Thank you, {order.customer_name.split(" ")[0]}!
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-base text-muted-foreground">
              We've received your order. As soon as your{" "}
              <strong className="text-foreground">
                {PAYMENT_METHOD_LABELS[order.payment_method]}
              </strong>{" "}
              payment is confirmed, we'll send you a confirmation email and
              start preparing your handmade piece. ✨
            </p>
          </div>

          <div className="mt-8 overflow-hidden rounded-3xl border border-border bg-background shadow-sm">
            <div className="bg-[var(--brand-soft)] px-6 py-5 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand)]">
                Order Number
              </p>
              <p className="font-heading mt-1 text-3xl text-foreground sm:text-4xl">
                {order.order_number}
              </p>
              <p className="mt-1 text-xs text-foreground/60">
                Save this number — you'll need it to track your order.
              </p>
            </div>

            <div className="grid gap-px bg-border sm:grid-cols-3">
              <Stat
                label="Payment"
                value={PAYMENT_METHOD_LABELS[order.payment_method]}
                sub="Awaiting confirmation"
              />
              <Stat label="Total" value={formatPKR(order.total_pkr)} />
              <Stat
                label="Items"
                value={String(items.reduce((s, i) => s + i.quantity, 0))}
              />
            </div>

            <ul className="divide-y divide-border">
              {items.map((it) => (
                <li key={it.id} className="flex gap-3 px-5 py-4 sm:px-6">
                  {it.product_image ? (
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-[var(--surface-soft)]">
                      <Image
                        src={it.product_image}
                        alt=""
                        fill
                        sizes="56px"
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div className="h-14 w-14 shrink-0 rounded-xl bg-[var(--surface-soft)]" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-semibold text-foreground">
                      {it.product_name}
                    </p>
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

            <div className="border-t border-border px-5 py-5 sm:px-6">
              <dl className="space-y-2 text-sm">
                <Row
                  label="Subtotal"
                  value={formatPKR(order.subtotal_pkr)}
                />
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
                <div className="flex items-center justify-between border-t border-border pt-3 text-base font-semibold text-foreground">
                  <dt>Total</dt>
                  <dd className="font-heading text-xl">
                    {formatPKR(order.total_pkr)}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <InfoCard
              icon={Mail}
              title="Check your email"
              body="We just sent the order details and payment instructions to your inbox."
            />
            <InfoCard
              icon={Package}
              title="What happens next?"
              body="Once we verify your payment, we'll start crafting and ship your piece within 2–4 weeks."
            />
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href={`/orders/${order.order_number}`}
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-[var(--brand)] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[var(--brand)]/25 transition-all hover:-translate-y-0.5"
            >
              <Search className="h-4 w-4" />
              Track this order
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/shop"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-foreground/20 bg-white px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:border-[var(--brand)] hover:text-[var(--brand)]"
            >
              <Home className="h-4 w-4" />
              Keep shopping
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

function Stat({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="bg-background px-5 py-4 text-center">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-base font-semibold text-foreground">{value}</p>
      {sub ? (
        <p className="text-[11px] text-muted-foreground">{sub}</p>
      ) : null}
    </div>
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

function InfoCard({
  icon: Icon,
  title,
  body,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-background p-5">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand)]">
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-3 font-heading text-base text-foreground">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}
