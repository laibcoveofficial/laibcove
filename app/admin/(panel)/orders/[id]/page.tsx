import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, ImageOff, Mail, Phone, MapPin } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { getSupabase } from "@/lib/supabase/server";
import {
  formatPKR,
  PAYMENT_METHOD_LABELS,
  type Order,
  type OrderItem,
  type Payment,
} from "@/lib/supabase/types";
import { Topbar } from "@/components/admin/topbar";
import {
  PaymentStatusBadge,
  OrderStatusBadge,
} from "@/components/admin/order-status-badge";
import { OrderStatusUpdater } from "@/components/admin/order-status-updater";
import { PaymentStatusUpdater } from "@/components/admin/payment-status-updater";

export const dynamic = "force-dynamic";

async function loadOrderDetail(id: string): Promise<{
  order: Order;
  items: OrderItem[];
  payments: Payment[];
} | null> {
  try {
    const supabase = getSupabase();
    const { data: order } = await supabase
      .from("orders")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (!order) return null;

    const [itemsResp, paymentsResp] = await Promise.all([
      supabase
        .from("order_items")
        .select("*")
        .eq("order_id", id)
        .order("created_at", { ascending: true }),
      supabase
        .from("payments")
        .select("*")
        .eq("order_id", id)
        .order("created_at", { ascending: false }),
    ]);

    return {
      order: order as Order,
      items: (itemsResp.data ?? []) as OrderItem[],
      payments: (paymentsResp.data ?? []) as Payment[],
    };
  } catch {
    return null;
  }
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  const data = await loadOrderDetail(id);
  if (!data) notFound();
  const { order, items, payments } = data;

  return (
    <>
      <Topbar
        email={session?.email || ""}
        title={`Order ${order.order_number}`}
      />
      <div className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground/70 hover:text-[var(--brand)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to orders
        </Link>

        <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-heading text-2xl text-foreground sm:text-3xl">
              {order.order_number}
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Placed{" "}
              {new Date(order.created_at).toLocaleString("en-PK", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
              {order.payment_verified_at
                ? ` · Payment verified ${new Date(order.payment_verified_at).toLocaleString("en-PK", { dateStyle: "medium", timeStyle: "short" })}`
                : ""}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <PaymentStatusBadge
              status={order.payment_status}
              method={order.payment_method}
            />
            <OrderStatusBadge status={order.order_status} />
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            {/* Items */}
            <section className="overflow-hidden rounded-2xl border border-border bg-background">
              <header className="border-b border-border px-5 py-4">
                <h3 className="font-heading text-lg text-foreground">Items</h3>
              </header>
              <ul className="divide-y divide-border">
                {items.map((it) => (
                  <li key={it.id} className="flex items-center gap-3 px-5 py-3">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-[var(--surface-soft)]">
                      {it.product_image ? (
                        <Image
                          src={it.product_image}
                          alt=""
                          fill
                          sizes="56px"
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                          <ImageOff className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">
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
              <div className="border-t border-border bg-[var(--surface-soft)] px-5 py-4">
                <dl className="space-y-1.5 text-sm">
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
                  <div className="flex justify-between border-t border-border pt-2 text-base font-semibold text-foreground">
                    <dt>Total</dt>
                    <dd className="font-heading">
                      {formatPKR(order.total_pkr)}
                    </dd>
                  </div>
                </dl>
              </div>
            </section>

            {/* Payment history */}
            <section className="overflow-hidden rounded-2xl border border-border bg-background">
              <header className="border-b border-border px-5 py-4">
                <h3 className="font-heading text-lg text-foreground">
                  Payment history
                </h3>
              </header>
              {payments.length === 0 ? (
                <p className="px-5 py-6 text-sm text-muted-foreground">
                  No payment events recorded yet.
                </p>
              ) : (
                <ul className="divide-y divide-border">
                  {payments.map((p) => (
                    <li
                      key={p.id}
                      className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 text-sm"
                    >
                      <div>
                        <p className="font-medium text-foreground">
                          {PAYMENT_METHOD_LABELS[p.method]} ·{" "}
                          {formatPKR(p.amount_pkr)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(p.created_at).toLocaleString("en-PK", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                          {p.reference ? ` · TID: ${p.reference}` : ""}
                        </p>
                        {p.notes ? (
                          <p className="mt-1 text-xs text-foreground/70">
                            {p.notes}
                          </p>
                        ) : null}
                      </div>
                      <PaymentStatusBadge status={p.status} />
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          <aside className="space-y-6">
            {/* Customer */}
            <section className="rounded-2xl border border-border bg-background p-5">
              <h3 className="font-heading text-lg text-foreground">Customer</h3>
              <p className="mt-3 text-sm font-semibold text-foreground">
                {order.customer_name}
              </p>
              <ul className="mt-2 space-y-1.5 text-sm text-foreground/85">
                <li className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                  <a
                    href={`mailto:${order.customer_email}`}
                    className="hover:text-[var(--brand)]"
                  >
                    {order.customer_email}
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                  <a
                    href={`tel:${order.customer_phone}`}
                    className="hover:text-[var(--brand)]"
                  >
                    {order.customer_phone}
                  </a>
                </li>
                <li className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 text-muted-foreground" />
                  <span>
                    {order.shipping_address}
                    <br />
                    {order.city}
                    {order.postal_code ? `, ${order.postal_code}` : ""}
                  </span>
                </li>
              </ul>
              {order.order_notes ? (
                <div className="mt-4 rounded-xl border border-dashed border-border p-3 text-xs">
                  <p className="font-semibold uppercase tracking-wider text-muted-foreground">
                    Notes
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-foreground/85">
                    {order.order_notes}
                  </p>
                </div>
              ) : null}
            </section>

            {/* Payment status updater */}
            <section className="rounded-2xl border border-border bg-background p-5">
              <h3 className="font-heading text-lg text-foreground">
                Payment status
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Marking as <strong>Paid</strong> sends a confirmation email to
                the customer.
              </p>
              <div className="mt-4">
                <PaymentStatusUpdater
                  id={order.id}
                  current={order.payment_status}
                  reference={order.payment_reference}
                  notes={order.payment_notes}
                />
              </div>
            </section>

            {/* Order status updater */}
            <section className="rounded-2xl border border-border bg-background p-5">
              <h3 className="font-heading text-lg text-foreground">
                Order status
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Updating status to shipped/delivered/cancelled also notifies
                the customer.
              </p>
              <div className="mt-4">
                <OrderStatusUpdater id={order.id} current={order.order_status} />
              </div>
            </section>

            <Link
              href={`/orders/${order.order_number}`}
              target="_blank"
              className="block rounded-2xl border border-dashed border-border bg-background p-4 text-center text-xs text-muted-foreground hover:border-[var(--brand)] hover:text-[var(--brand)]"
            >
              View customer's tracking page →
            </Link>
          </aside>
        </div>
      </div>
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
