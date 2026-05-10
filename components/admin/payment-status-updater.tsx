"use client";

import { useState, useTransition } from "react";
import { Loader2, Save } from "lucide-react";
import {
  PAYMENT_STATUSES,
  PAYMENT_STATUS_LABELS,
  type PaymentStatus,
} from "@/lib/supabase/types";
import { updatePaymentStatus } from "@/app/admin/(panel)/orders/actions";

export function PaymentStatusUpdater({
  id,
  current,
  reference,
  notes,
}: {
  id: string;
  current: PaymentStatus;
  reference: string | null;
  notes: string | null;
}) {
  const [status, setStatus] = useState<PaymentStatus>(current);
  const [ref, setRef] = useState(reference ?? "");
  const [note, setNote] = useState(notes ?? "");
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const dirty =
    status !== current ||
    ref !== (reference ?? "") ||
    note !== (notes ?? "");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaved(false);
    const fd = new FormData();
    fd.set("id", id);
    fd.set("status", status);
    fd.set("reference", ref);
    fd.set("notes", note);
    start(async () => {
      try {
        await updatePaymentStatus(fd);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } catch (err) {
        setError((err as Error).message);
      }
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value as PaymentStatus)}
        className="block w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm font-medium text-foreground outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/20"
      >
        {PAYMENT_STATUSES.map((s) => (
          <option key={s} value={s}>
            {PAYMENT_STATUS_LABELS[s]}
          </option>
        ))}
      </select>

      <input
        type="text"
        value={ref}
        onChange={(e) => setRef(e.target.value)}
        placeholder="Transaction ID (optional)"
        className="block w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/20"
      />

      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={3}
        placeholder="Internal notes (optional)"
        className="block w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/20"
      />

      {error ? (
        <p className="text-xs text-red-600">{error}</p>
      ) : saved ? (
        <p className="text-xs font-semibold text-emerald-700">
          ✓ Payment status updated
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending || !dirty}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--brand)] px-5 py-2.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
      >
        {pending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Save className="h-4 w-4" />
        )}
        Save payment changes
      </button>
    </form>
  );
}
