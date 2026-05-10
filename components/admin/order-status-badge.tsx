import {
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
  ORDER_STATUS_LABELS,
  type PaymentMethod,
  type PaymentStatus,
  type OrderStatus,
} from "@/lib/supabase/types";

const PAYMENT_TONE: Record<PaymentStatus, string> = {
  pending: "bg-amber-50 text-amber-800 ring-amber-200",
  paid: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  failed: "bg-red-50 text-red-800 ring-red-200",
  refunded: "bg-gray-100 text-gray-700 ring-gray-200",
};

const ORDER_TONE: Record<OrderStatus, string> = {
  pending: "bg-amber-50 text-amber-800 ring-amber-200",
  confirmed: "bg-blue-50 text-blue-800 ring-blue-200",
  processing: "bg-purple-50 text-purple-800 ring-purple-200",
  shipped: "bg-indigo-50 text-indigo-800 ring-indigo-200",
  delivered: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  cancelled: "bg-gray-100 text-gray-700 ring-gray-200",
};

export function PaymentStatusBadge({
  status,
  method,
}: {
  status: PaymentStatus;
  method?: PaymentMethod;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ${PAYMENT_TONE[status]}`}
    >
      {method ? (
        <span className="opacity-70">{PAYMENT_METHOD_LABELS[method]}</span>
      ) : null}
      {method ? <span aria-hidden>·</span> : null}
      {PAYMENT_STATUS_LABELS[status]}
    </span>
  );
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ${ORDER_TONE[status]}`}
    >
      {ORDER_STATUS_LABELS[status]}
    </span>
  );
}
