import Link from "next/link";
import { Eye, Filter } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { getSupabase } from "@/lib/supabase/server";
import {
  formatPKR,
  ORDER_STATUS_LABELS,
  ORDER_STATUSES,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUSES,
  type Order,
  type OrderStatus,
  type PaymentStatus,
} from "@/lib/supabase/types";
import { Topbar } from "@/components/admin/topbar";
import { PaymentStatusBadge, OrderStatusBadge } from "@/components/admin/order-status-badge";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  payment?: string;
  status?: string;
}>;

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await getSession();
  const sp = await searchParams;
  const paymentFilter = (PAYMENT_STATUSES as string[]).includes(sp.payment ?? "")
    ? (sp.payment as PaymentStatus)
    : undefined;
  const statusFilter = (ORDER_STATUSES as string[]).includes(sp.status ?? "")
    ? (sp.status as OrderStatus)
    : undefined;

  let orders: Order[] = [];
  let counts = { total: 0, pending: 0, paid: 0, failed: 0 };
  let error: string | null = null;

  try {
    const supabase = getSupabase();
    let query = supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    if (paymentFilter) query = query.eq("payment_status", paymentFilter);
    if (statusFilter) query = query.eq("order_status", statusFilter);

    const [ordersResp, totalResp, pendingResp, paidResp, failedResp] =
      await Promise.all([
        query,
        supabase.from("orders").select("*", { count: "exact", head: true }),
        supabase
          .from("orders")
          .select("*", { count: "exact", head: true })
          .eq("payment_status", "pending"),
        supabase
          .from("orders")
          .select("*", { count: "exact", head: true })
          .eq("payment_status", "paid"),
        supabase
          .from("orders")
          .select("*", { count: "exact", head: true })
          .eq("payment_status", "failed"),
      ]);

    if (ordersResp.error) error = ordersResp.error.message;
    else orders = (ordersResp.data ?? []) as Order[];
    counts = {
      total: totalResp.count ?? 0,
      pending: pendingResp.count ?? 0,
      paid: paidResp.count ?? 0,
      failed: failedResp.count ?? 0,
    };
  } catch (err) {
    error = (err as Error).message;
  }

  return (
    <>
      <Topbar email={session?.email || ""} title="Orders" />
      <div className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <p className="text-sm text-muted-foreground">
          Verify payments and update order status. Customers receive an email
          confirmation when you mark an order as paid.
        </p>

        {/* Stat cards */}
        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Total orders" value={counts.total} tone="brand" />
          <StatCard label="Awaiting payment" value={counts.pending} tone="amber" />
          <StatCard label="Paid" value={counts.paid} tone="emerald" />
          <StatCard label="Failed" value={counts.failed} tone="red" />
        </div>

        {/* Filters */}
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <Filter className="h-3.5 w-3.5" />
            Filter:
          </span>
          <FilterPill
            href="/admin/orders"
            active={!paymentFilter && !statusFilter}
            label="All"
          />
          {PAYMENT_STATUSES.map((s) => (
            <FilterPill
              key={s}
              href={`/admin/orders?payment=${s}`}
              active={paymentFilter === s}
              label={`Payment: ${PAYMENT_STATUS_LABELS[s]}`}
            />
          ))}
          {ORDER_STATUSES.map((s) => (
            <FilterPill
              key={s}
              href={`/admin/orders?status=${s}`}
              active={statusFilter === s}
              label={`Status: ${ORDER_STATUS_LABELS[s]}`}
            />
          ))}
        </div>

        {error ? (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
            <p className="font-semibold">Couldn't load orders.</p>
            <p className="mt-1">{error}</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-border bg-background p-10 text-center">
            <p className="font-heading text-lg text-foreground">No orders yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              When customers place orders they'll appear here.
            </p>
          </div>
        ) : (
          <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-background">
            <table className="hidden w-full lg:table">
              <thead className="bg-[var(--surface-soft)] text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-5 py-3.5">Order</th>
                  <th className="px-5 py-3.5">Customer</th>
                  <th className="px-5 py-3.5">Total</th>
                  <th className="px-5 py-3.5">Payment</th>
                  <th className="px-5 py-3.5">Order status</th>
                  <th className="px-5 py-3.5">Placed</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-sm">
                {orders.map((o) => (
                  <Row key={o.id} order={o} />
                ))}
              </tbody>
            </table>

            {/* Mobile cards */}
            <ul className="divide-y divide-border lg:hidden">
              {orders.map((o) => (
                <li key={o.id}>
                  <MobileCard order={o} />
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </>
  );
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "brand" | "amber" | "emerald" | "red";
}) {
  const tint =
    tone === "brand"
      ? "bg-[var(--brand-soft)] text-[var(--brand)]"
      : tone === "amber"
        ? "bg-amber-50 text-amber-700"
        : tone === "emerald"
          ? "bg-emerald-50 text-emerald-700"
          : "bg-red-50 text-red-700";
  return (
    <div className="rounded-2xl border border-border bg-background p-5">
      <p className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${tint}`}>
        {label}
      </p>
      <p className="font-heading mt-3 text-3xl text-foreground">{value}</p>
    </div>
  );
}

function FilterPill({
  href,
  active,
  label,
}: {
  href: string;
  active: boolean;
  label: string;
}) {
  return (
    <Link
      href={href}
      className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
        active
          ? "border-[var(--brand)] bg-[var(--brand)] text-white"
          : "border-border bg-background text-foreground/70 hover:border-[var(--brand)] hover:text-[var(--brand)]"
      }`}
    >
      {label}
    </Link>
  );
}

function Row({ order }: { order: Order }) {
  return (
    <tr className="transition-colors hover:bg-[var(--surface-soft)]">
      <td className="px-5 py-3">
        <Link
          href={`/admin/orders/${order.id}`}
          className="font-mono text-sm font-semibold text-foreground hover:text-[var(--brand)]"
        >
          {order.order_number}
        </Link>
      </td>
      <td className="px-5 py-3">
        <p className="font-semibold text-foreground">{order.customer_name}</p>
        <p className="text-xs text-muted-foreground">{order.customer_email}</p>
      </td>
      <td className="px-5 py-3 font-medium text-foreground">
        {formatPKR(order.total_pkr)}
      </td>
      <td className="px-5 py-3">
        <PaymentStatusBadge
          status={order.payment_status}
          method={order.payment_method}
        />
      </td>
      <td className="px-5 py-3">
        <OrderStatusBadge status={order.order_status} />
      </td>
      <td className="px-5 py-3 text-xs text-muted-foreground">
        {new Date(order.created_at).toLocaleDateString()}
      </td>
      <td className="px-5 py-3 text-right">
        <Link
          href={`/admin/orders/${order.id}`}
          aria-label="View"
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-white text-[var(--brand)] hover:border-[var(--brand)] hover:bg-[var(--brand-soft)]"
        >
          <Eye className="h-3.5 w-3.5" />
        </Link>
      </td>
    </tr>
  );
}

function MobileCard({ order }: { order: Order }) {
  return (
    <Link
      href={`/admin/orders/${order.id}`}
      className="flex flex-col gap-2 p-4 transition-colors hover:bg-[var(--surface-soft)]"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-mono text-sm font-semibold text-foreground">
            {order.order_number}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {order.customer_name} · {PAYMENT_METHOD_LABELS[order.payment_method]}
          </p>
        </div>
        <p className="shrink-0 text-sm font-semibold text-foreground">
          {formatPKR(order.total_pkr)}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        <PaymentStatusBadge
          status={order.payment_status}
          method={order.payment_method}
        />
        <OrderStatusBadge status={order.order_status} />
        <span className="ml-auto text-[11px] text-muted-foreground">
          {new Date(order.created_at).toLocaleDateString()}
        </span>
      </div>
    </Link>
  );
}
