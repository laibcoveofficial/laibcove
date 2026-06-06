"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Loader2, Save, X, Percent, Banknote } from "lucide-react";
import {
  createCoupon,
  updateCoupon,
  type CouponFormState,
} from "@/app/admin/(panel)/coupons/actions";
import type { Coupon } from "@/lib/supabase/types";

const initialState: CouponFormState = { status: "idle", message: "" };

const inputClass =
  "mt-1.5 block w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/20";

// timestamptz from the DB → value an <input type="datetime-local"> accepts
// ("YYYY-MM-DDTHH:mm"), rendered in the browser's local time.
function toLocalInput(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

export function CouponForm({ coupon }: { coupon?: Coupon }) {
  const isEditing = !!coupon;
  const action = isEditing ? updateCoupon : createCoupon;
  const [state, formAction, pending] = useActionState(action, initialState);

  const [type, setType] = useState<Coupon["type"]>(coupon?.type ?? "percent");

  return (
    <form action={formAction} className="space-y-8">
      {isEditing && <input type="hidden" name="id" value={coupon.id} />}

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          {/* Code + description */}
          <section className="rounded-3xl border border-border bg-background p-6 shadow-sm sm:p-7">
            <h2 className="font-heading mb-6 text-xl text-foreground">
              Coupon Details
            </h2>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="code"
                  className="text-sm font-medium text-foreground"
                >
                  Coupon code
                </label>
                <input
                  type="text"
                  id="code"
                  name="code"
                  defaultValue={coupon?.code}
                  placeholder="e.g. EID25"
                  autoCapitalize="characters"
                  className={`${inputClass} uppercase tracking-wider placeholder:normal-case placeholder:tracking-normal`}
                  required
                />
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Letters, numbers, dashes &amp; underscores. Shown to customers
                  exactly as typed (stored uppercase).
                </p>
              </div>
              <div>
                <label
                  htmlFor="description"
                  className="text-sm font-medium text-foreground"
                >
                  Description (optional)
                </label>
                <input
                  type="text"
                  id="description"
                  name="description"
                  defaultValue={coupon?.description ?? ""}
                  placeholder="Internal note, e.g. Eid campaign 2026"
                  className={inputClass}
                />
              </div>
            </div>
          </section>

          {/* Discount */}
          <section className="rounded-3xl border border-border bg-background p-6 shadow-sm sm:p-7">
            <h2 className="font-heading mb-6 text-xl text-foreground">
              Discount
            </h2>

            {/* Type toggle */}
            <div className="grid gap-3 sm:grid-cols-2">
              <TypeOption
                value="percent"
                current={type}
                onSelect={setType}
                icon={<Percent className="h-5 w-5" />}
                label="Percentage"
                hint="e.g. 10% off the subtotal"
              />
              <TypeOption
                value="flat"
                current={type}
                onSelect={setType}
                icon={<Banknote className="h-5 w-5" />}
                label="Fixed amount"
                hint="e.g. PKR 500 off"
              />
            </div>
            <input type="hidden" name="type" value={type} />

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="value"
                  className="text-sm font-medium text-foreground"
                >
                  {type === "percent" ? "Percentage (%)" : "Amount (PKR)"}
                </label>
                <input
                  type="number"
                  id="value"
                  name="value"
                  defaultValue={coupon?.value ?? ""}
                  min={0}
                  max={type === "percent" ? 100 : undefined}
                  step={type === "percent" ? 1 : 0.01}
                  placeholder={type === "percent" ? "10" : "500"}
                  className={inputClass}
                  required
                />
              </div>
              {type === "percent" ? (
                <div>
                  <label
                    htmlFor="max_discount_pkr"
                    className="text-sm font-medium text-foreground"
                  >
                    Max discount (PKR, optional)
                  </label>
                  <input
                    type="number"
                    id="max_discount_pkr"
                    name="max_discount_pkr"
                    defaultValue={coupon?.max_discount_pkr ?? ""}
                    min={0}
                    step={0.01}
                    placeholder="No cap"
                    className={inputClass}
                  />
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    Caps the discount for large carts.
                  </p>
                </div>
              ) : null}
            </div>
          </section>

          {/* Conditions */}
          <section className="rounded-3xl border border-border bg-background p-6 shadow-sm sm:p-7">
            <h2 className="font-heading mb-6 text-xl text-foreground">
              Conditions (all optional)
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="min_order_pkr"
                  className="text-sm font-medium text-foreground"
                >
                  Minimum order (PKR)
                </label>
                <input
                  type="number"
                  id="min_order_pkr"
                  name="min_order_pkr"
                  defaultValue={coupon?.min_order_pkr ?? 0}
                  min={0}
                  step={0.01}
                  placeholder="0"
                  className={inputClass}
                />
              </div>
              <div>
                <label
                  htmlFor="usage_limit"
                  className="text-sm font-medium text-foreground"
                >
                  Usage limit
                </label>
                <input
                  type="number"
                  id="usage_limit"
                  name="usage_limit"
                  defaultValue={coupon?.usage_limit ?? ""}
                  min={1}
                  step={1}
                  placeholder="Unlimited"
                  className={inputClass}
                />
                {isEditing ? (
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    Used {coupon!.times_used}{" "}
                    {coupon!.times_used === 1 ? "time" : "times"} so far.
                  </p>
                ) : null}
              </div>
              <div>
                <label
                  htmlFor="starts_at"
                  className="text-sm font-medium text-foreground"
                >
                  Starts at
                </label>
                <input
                  type="datetime-local"
                  id="starts_at"
                  name="starts_at"
                  defaultValue={toLocalInput(coupon?.starts_at)}
                  className={inputClass}
                />
              </div>
              <div>
                <label
                  htmlFor="expires_at"
                  className="text-sm font-medium text-foreground"
                >
                  Expires at
                </label>
                <input
                  type="datetime-local"
                  id="expires_at"
                  name="expires_at"
                  defaultValue={toLocalInput(coupon?.expires_at)}
                  className={inputClass}
                />
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar: status + actions */}
        <div className="space-y-6 lg:col-span-4">
          <section className="rounded-3xl border border-border bg-background p-6 shadow-sm sm:p-7">
            <h2 className="font-heading mb-4 text-xl text-foreground">Status</h2>
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                name="is_active"
                defaultChecked={coupon ? coupon.is_active : true}
                className="h-5 w-5 rounded border-border text-[var(--brand)] accent-[var(--brand)] focus:ring-[var(--brand)]/20"
              />
              <span className="text-sm font-medium text-foreground">
                Active
              </span>
            </label>
            <p className="mt-2 text-xs text-muted-foreground">
              Inactive coupons are rejected at checkout, even if not yet expired.
            </p>
          </section>

          {state.status === "error" && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
              {state.message}
            </div>
          )}

          <div className="flex flex-col gap-3">
            <button
              type="submit"
              disabled={pending}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--brand)] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[var(--brand)]/25 transition-all hover:-translate-y-0.5 disabled:opacity-50"
            >
              {pending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {isEditing ? "Save changes" : "Create coupon"}
            </button>
            <Link
              href="/admin/coupons"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-border bg-white px-6 py-3.5 text-sm font-semibold text-foreground transition-colors hover:bg-[var(--surface-soft)]"
            >
              <X className="h-4 w-4" />
              Cancel
            </Link>
          </div>
        </div>
      </div>
    </form>
  );
}

function TypeOption({
  value,
  current,
  onSelect,
  icon,
  label,
  hint,
}: {
  value: Coupon["type"];
  current: Coupon["type"];
  onSelect: (v: Coupon["type"]) => void;
  icon: React.ReactNode;
  label: string;
  hint: string;
}) {
  const active = current === value;
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      aria-pressed={active}
      className={`flex items-start gap-3 rounded-2xl border-2 p-4 text-left transition-all ${
        active
          ? "border-[var(--brand)] bg-[var(--brand-soft)] shadow-sm"
          : "border-border bg-background hover:border-[var(--brand)]/40"
      }`}
    >
      <span
        className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
          active
            ? "bg-[var(--brand)] text-white"
            : "bg-[var(--surface-soft)] text-foreground/70"
        }`}
      >
        {icon}
      </span>
      <span>
        <span className="block text-sm font-semibold text-foreground">
          {label}
        </span>
        <span className="block text-xs text-muted-foreground">{hint}</span>
      </span>
    </button>
  );
}
