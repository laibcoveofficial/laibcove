"use client";

import { useTransition } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { deleteCoupon } from "@/app/admin/(panel)/coupons/actions";

export function CouponDeleteButton({
  id,
  code,
}: {
  id: string;
  code: string;
}) {
  const [pending, start] = useTransition();

  const onClick = () => {
    if (
      !window.confirm(
        `Delete coupon "${code}"? This can't be undone. Orders that already used it keep their saved discount.`,
      )
    )
      return;
    const fd = new FormData();
    fd.set("id", id);
    start(() => {
      deleteCoupon(fd);
    });
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      aria-label={`Delete ${code}`}
      title="Delete"
      className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-white text-red-600 transition-colors hover:border-red-300 hover:bg-red-50 disabled:opacity-60"
    >
      {pending ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Trash2 className="h-3.5 w-3.5" />
      )}
    </button>
  );
}
