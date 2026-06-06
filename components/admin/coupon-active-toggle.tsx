"use client";

import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import { setCouponActive } from "@/app/admin/(panel)/coupons/actions";

// A small pill that flips a coupon's active state inline from the list.
export function CouponActiveToggle({
  id,
  active,
}: {
  id: string;
  active: boolean;
}) {
  const [pending, start] = useTransition();

  const onClick = () => {
    const fd = new FormData();
    fd.set("id", id);
    fd.set("active", active ? "false" : "true");
    start(() => {
      setCouponActive(fd);
    });
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      aria-pressed={active}
      title={active ? "Click to deactivate" : "Click to activate"}
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition-colors disabled:opacity-60 ${
        active
          ? "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200 hover:bg-emerald-100"
          : "bg-foreground/5 text-foreground/60 ring-1 ring-inset ring-border hover:bg-foreground/10"
      }`}
    >
      {pending ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <span
          aria-hidden
          className={`h-1.5 w-1.5 rounded-full ${
            active ? "bg-emerald-500" : "bg-foreground/40"
          }`}
        />
      )}
      {active ? "Active" : "Inactive"}
    </button>
  );
}
