"use client";

import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import {
  ORDER_STATUSES,
  ORDER_STATUS_LABELS,
  type OrderStatus,
} from "@/lib/supabase/types";
import { updateOrderStatus } from "@/app/admin/(panel)/orders/actions";

export function OrderStatusUpdater({
  id,
  current,
}: {
  id: string;
  current: OrderStatus;
}) {
  const [pending, start] = useTransition();

  return (
    <div className="flex items-center gap-2">
      <select
        defaultValue={current}
        disabled={pending}
        onChange={(e) => {
          const next = e.target.value as OrderStatus;
          if (next === current) return;
          const fd = new FormData();
          fd.set("id", id);
          fd.set("status", next);
          start(() => {
            updateOrderStatus(fd);
          });
        }}
        className="block w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm font-medium text-foreground outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/20"
      >
        {ORDER_STATUSES.map((s) => (
          <option key={s} value={s}>
            {ORDER_STATUS_LABELS[s]}
          </option>
        ))}
      </select>
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin text-[var(--brand)]" />
      ) : null}
    </div>
  );
}
