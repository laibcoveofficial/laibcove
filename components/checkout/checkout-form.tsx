"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  ArrowLeft,
  Loader2,
  ShoppingBag,
  ShieldCheck,
  Tag,
  X,
  Check,
  CreditCard,
  Copy,
} from "lucide-react";
import { useCart } from "@/lib/cart/context";
import { CheckoutSteps, type CheckoutStep } from "./checkout-steps";
import { OrderSummary } from "./order-summary";
import { PAYMENT_METHOD_META } from "@/lib/payments/public-config";
import {
  DEFAULT_DELIVERY_PKR,
  DEFAULT_FREE_DELIVERY_THRESHOLD_PKR,
} from "@/lib/orders/delivery";
import { formatPKR, type PaymentMethod } from "@/lib/supabase/types";
import { placeOrder, checkCoupon } from "@/lib/orders/actions";

type AccountInfo = {
  method: PaymentMethod;
  accountNumber: string;
  accountTitle: string;
  instructions: string;
};

type ShippingFormState = {
  full_name: string;
  email: string;
  phone: string;
  shipping_address: string;
  city: string;
  postal_code: string;
  order_notes: string;
};

const EMPTY_SHIPPING: ShippingFormState = {
  full_name: "",
  email: "",
  phone: "",
  shipping_address: "",
  city: "",
  postal_code: "",
  order_notes: "",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+0-9 ()\-]{7,20}$/;

function calcDelivery(subtotal: number, flat: number, threshold: number) {
  if (subtotal <= 0) return 0;
  if (threshold > 0 && subtotal >= threshold) return 0;
  return flat;
}

export function CheckoutForm({
  paymentAccounts,
  delivery: deliveryFlat,
  freeDeliveryThreshold,
}: {
  paymentAccounts: AccountInfo[];
  delivery?: number;
  freeDeliveryThreshold?: number;
}) {
  const router = useRouter();
  const { items, hydrated, totals, clear } = useCart();
  const [step, setStep] = useState<CheckoutStep>("shipping");
  const [shipping, setShipping] = useState<ShippingFormState>(EMPTY_SHIPPING);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(
    null,
  );
  const [paymentReference, setPaymentReference] = useState("");
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discount: number;
  } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, startSubmit] = useTransition();
  const [checkingCoupon, setCheckingCoupon] = useState(false);
  const [hasCheckedEmpty, setHasCheckedEmpty] = useState(false);

  const flat = deliveryFlat ?? DEFAULT_DELIVERY_PKR;
  const threshold = freeDeliveryThreshold ?? DEFAULT_FREE_DELIVERY_THRESHOLD_PKR;

  // Recompute totals server-shape (so coupon discount applies)
  const computed = useMemo(() => {
    const subtotal = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
    const delivery = calcDelivery(subtotal, flat, threshold);
    let discount = appliedCoupon?.discount ?? 0;
    if (discount > subtotal) discount = subtotal;
    const total = Math.max(0, subtotal + delivery - discount);
    return { subtotal, delivery, discount, total };
  }, [items, appliedCoupon, flat, threshold]);

  // If cart becomes empty after hydration, redirect back to the cart page
  useEffect(() => {
    if (!hydrated) return;
    if (items.length === 0 && !hasCheckedEmpty) {
      setHasCheckedEmpty(true);
    }
  }, [hydrated, items.length, hasCheckedEmpty]);

  // Persist shipping form to sessionStorage to survive accidental refreshes
  useEffect(() => {
    if (!hydrated) return;
    try {
      const raw = window.sessionStorage.getItem("laibcove_checkout_shipping");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") {
          setShipping((prev) => ({ ...prev, ...parsed }));
        }
      }
    } catch {
      /* ignore */
    }
  }, [hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.sessionStorage.setItem(
        "laibcove_checkout_shipping",
        JSON.stringify(shipping),
      );
    } catch {
      /* ignore */
    }
  }, [shipping, hydrated]);

  // Re-validate coupon if subtotal changes (cart updated)
  useEffect(() => {
    if (!appliedCoupon) return;
    let cancelled = false;
    (async () => {
      const res = await checkCoupon(appliedCoupon.code, computed.subtotal);
      if (cancelled) return;
      if (res.ok) {
        setAppliedCoupon({ code: res.code, discount: res.discount });
      } else {
        setAppliedCoupon(null);
        setCouponError(res.error);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [computed.subtotal]);

  const validateShipping = (): boolean => {
    const e: Record<string, string> = {};
    if (shipping.full_name.trim().length < 2) e.full_name = "Required";
    if (!EMAIL_RE.test(shipping.email.trim().toLowerCase())) e.email = "Invalid email";
    if (!PHONE_RE.test(shipping.phone.trim())) e.phone = "Invalid phone";
    if (shipping.shipping_address.trim().length < 5)
      e.shipping_address = "Please enter a complete address";
    if (shipping.city.trim().length < 2) e.city = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onContinueToPayment = () => {
    if (!validateShipping()) return;
    setStep("payment");
    setSubmitError(null);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onApplyCoupon = async () => {
    setCouponError(null);
    if (!couponInput.trim()) {
      setCouponError("Enter a coupon code first.");
      return;
    }
    setCheckingCoupon(true);
    const res = await checkCoupon(couponInput.trim(), computed.subtotal);
    setCheckingCoupon(false);
    if (!res.ok) {
      setCouponError(res.error);
      setAppliedCoupon(null);
      return;
    }
    setAppliedCoupon({ code: res.code, discount: res.discount });
    setCouponInput("");
  };

  const onRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError(null);
  };

  const onPlaceOrder = () => {
    if (!paymentMethod) {
      setSubmitError("Please choose a payment method.");
      return;
    }
    if (!paymentReference.trim()) {
      setErrors((prev) => ({
        ...prev,
        payment_reference: "Please enter the Transaction ID after sending your payment.",
      }));
      return;
    }
    setErrors((prev) => {
      const next = { ...prev };
      delete next.payment_reference;
      return next;
    });
    setSubmitError(null);
    startSubmit(async () => {
      const result = await placeOrder({
        ...shipping,
        payment_method: paymentMethod,
        payment_reference: paymentReference.trim(),
        coupon_code: appliedCoupon?.code,
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          variantName: i.variantName ?? undefined,
        })),
      });
      if (!result.ok) {
        setSubmitError(result.error);
        if (result.fieldErrors) setErrors(result.fieldErrors);
        return;
      }
      // Success — clear cart, clear sessionStorage, redirect to success page
      clear();
      try {
        window.sessionStorage.removeItem("laibcove_checkout_shipping");
      } catch {
        /* ignore */
      }
      router.push(`/checkout/success/${result.orderNumber}`);
    });
  };

  // Empty cart guard
  if (hydrated && items.length === 0) {
    return (
      <div className="mx-auto max-w-md rounded-3xl border border-dashed border-border bg-background p-10 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--brand-soft)] text-[var(--brand)]">
          <ShoppingBag className="h-7 w-7" />
        </div>
        <p className="font-heading mt-4 text-xl text-foreground">
          Nothing to check out
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Your cart is empty. Add a piece first.
        </p>
        <Link
          href="/shop"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-[var(--brand)] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[var(--brand)]/25"
        >
          Browse the shop
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  if (!hydrated) {
    return (
      <div className="rounded-3xl border border-border bg-background p-10 text-center text-muted-foreground">
        Loading checkout…
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 rounded-3xl border border-border bg-background p-5 shadow-sm sm:p-6">
        <CheckoutSteps active={step} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-8">
        {/* Left: form */}
        <div className="space-y-6">
          {step === "shipping" ? (
            <ShippingStep
              shipping={shipping}
              setShipping={setShipping}
              errors={errors}
              onSubmit={onContinueToPayment}
            />
          ) : null}

          {step === "payment" ? (
            <PaymentStep
              shipping={shipping}
              paymentAccounts={paymentAccounts}
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
              paymentReference={paymentReference}
              setPaymentReference={setPaymentReference}
              paymentReferenceError={errors.payment_reference}
              onClearPaymentReferenceError={() =>
                setErrors((prev) => {
                  const next = { ...prev };
                  delete next.payment_reference;
                  return next;
                })
              }
              total={computed.total}
              submitError={submitError}
              submitting={submitting}
              onBack={() => setStep("shipping")}
              onPlaceOrder={onPlaceOrder}
            />
          ) : null}
        </div>

        {/* Right: order summary + coupon */}
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <OrderSummary
            items={items}
            subtotal={computed.subtotal}
            delivery={computed.delivery}
            discount={computed.discount}
            total={computed.total}
            couponCode={appliedCoupon?.code}
            freeDeliveryThreshold={threshold}
          />

          <div className="rounded-3xl border border-border bg-background p-5">
            <label
              htmlFor="coupon"
              className="flex items-center gap-2 text-sm font-semibold text-foreground"
            >
              <Tag className="h-4 w-4 text-[var(--brand)]" />
              Have a coupon?
            </label>
            {appliedCoupon ? (
              <div className="mt-3 flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm">
                <div>
                  <p className="font-semibold text-emerald-800">
                    {appliedCoupon.code}
                  </p>
                  <p className="text-xs text-emerald-700">
                    Saved {formatPKR(appliedCoupon.discount)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onRemoveCoupon}
                  aria-label="Remove coupon"
                  className="inline-flex h-7 w-7 items-center justify-center rounded-full text-emerald-700 hover:bg-emerald-100"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <>
                <div className="mt-3 flex gap-2">
                  <input
                    id="coupon"
                    type="text"
                    placeholder="Enter code"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        onApplyCoupon();
                      }
                    }}
                    className="flex-1 rounded-full border border-border bg-background px-4 py-2.5 text-sm uppercase tracking-wider outline-none placeholder:normal-case placeholder:tracking-normal placeholder:text-muted-foreground focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/20"
                  />
                  <button
                    type="button"
                    onClick={onApplyCoupon}
                    disabled={checkingCoupon || !couponInput.trim()}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-foreground/20 bg-white px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-[var(--brand)] hover:text-[var(--brand)] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {checkingCoupon ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : null}
                    Apply
                  </button>
                </div>
                {couponError ? (
                  <p className="mt-2 text-xs text-red-600">{couponError}</p>
                ) : null}
              </>
            )}
          </div>

          <p className="flex items-center gap-2 px-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-[var(--brand)]" />
            Your information is sent over a secure connection.
          </p>
        </aside>
      </div>
    </div>
  );
}

// =========================================================================
// Shipping step
// =========================================================================
function ShippingStep({
  shipping,
  setShipping,
  errors,
  onSubmit,
}: {
  shipping: ShippingFormState;
  setShipping: React.Dispatch<React.SetStateAction<ShippingFormState>>;
  errors: Record<string, string>;
  onSubmit: () => void;
}) {
  const set = (k: keyof ShippingFormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setShipping((prev) => ({ ...prev, [k]: e.target.value }));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="rounded-3xl border border-border bg-background p-6 shadow-sm sm:p-7"
    >
      <header className="mb-6">
        <h2 className="font-heading text-2xl text-foreground">
          Shipping Details
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Where should we send your handmade piece?
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Full name"
          required
          error={errors.full_name}
          input={
            <input
              type="text"
              autoComplete="name"
              value={shipping.full_name}
              onChange={set("full_name")}
              className={inputClass(errors.full_name)}
              placeholder="Aliya Khan"
            />
          }
        />
        <Field
          label="Phone number"
          required
          error={errors.phone}
          input={
            <input
              type="tel"
              autoComplete="tel"
              value={shipping.phone}
              onChange={set("phone")}
              className={inputClass(errors.phone)}
              placeholder="03XX XXXXXXX"
            />
          }
        />
        <Field
          label="Email address"
          required
          error={errors.email}
          className="sm:col-span-2"
          input={
            <input
              type="email"
              autoComplete="email"
              value={shipping.email}
              onChange={set("email")}
              className={inputClass(errors.email)}
              placeholder="you@example.com"
            />
          }
        />
        <Field
          label="Shipping address"
          required
          error={errors.shipping_address}
          className="sm:col-span-2"
          input={
            <textarea
              autoComplete="street-address"
              rows={3}
              value={shipping.shipping_address}
              onChange={set("shipping_address")}
              className={inputClass(errors.shipping_address)}
              placeholder="House #, Street, Area / Block, Sector"
            />
          }
        />
        <Field
          label="City"
          required
          error={errors.city}
          input={
            <input
              type="text"
              autoComplete="address-level2"
              value={shipping.city}
              onChange={set("city")}
              className={inputClass(errors.city)}
              placeholder="Wah Cantt"
            />
          }
        />
        <Field
          label="Postal code"
          error={errors.postal_code}
          input={
            <input
              type="text"
              autoComplete="postal-code"
              value={shipping.postal_code}
              onChange={set("postal_code")}
              className={inputClass()}
              placeholder="75300"
            />
          }
        />
        <Field
          label="Order notes"
          hint="Optional — anything we should know about your order"
          className="sm:col-span-2"
          input={
            <textarea
              rows={3}
              value={shipping.order_notes}
              onChange={set("order_notes")}
              className={inputClass()}
              placeholder="Delivery instructions, color preference, etc."
            />
          }
        />
      </div>

      <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/cart"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground/70 hover:text-[var(--brand)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to cart
        </Link>
        <button
          type="submit"
          className="group inline-flex items-center justify-center gap-2 rounded-full bg-[var(--brand)] px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[var(--brand)]/25 transition-all hover:-translate-y-0.5"
        >
          Continue to Payment
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </form>
  );
}

// =========================================================================
// Payment step
// =========================================================================
function PaymentStep({
  shipping,
  paymentAccounts,
  paymentMethod,
  setPaymentMethod,
  paymentReference,
  setPaymentReference,
  paymentReferenceError,
  onClearPaymentReferenceError,
  total,
  submitError,
  submitting,
  onBack,
  onPlaceOrder,
}: {
  shipping: ShippingFormState;
  paymentAccounts: AccountInfo[];
  paymentMethod: PaymentMethod | null;
  setPaymentMethod: (m: PaymentMethod) => void;
  paymentReference: string;
  setPaymentReference: (s: string) => void;
  paymentReferenceError?: string;
  onClearPaymentReferenceError: () => void;
  total: number;
  submitError: string | null;
  submitting: boolean;
  onBack: () => void;
  onPlaceOrder: () => void;
}) {
  const selectedAccount = paymentAccounts.find(
    (a) => a.method === paymentMethod,
  );

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-border bg-background p-6 shadow-sm sm:p-7">
        <header className="mb-6 flex items-center justify-between gap-3">
          <div>
            <h2 className="font-heading text-2xl text-foreground">
              Choose Payment Method
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Send the order total via your preferred mobile wallet — we'll
              confirm by email once the payment clears.
            </p>
          </div>
          <span className="hidden shrink-0 rounded-full bg-[var(--brand-soft)] px-3 py-1 text-xs font-semibold text-[var(--brand)] sm:inline-flex">
            Online only
          </span>
        </header>

        <div className="grid gap-3 sm:grid-cols-2">
          {paymentAccounts.map((acc) => {
            const meta = PAYMENT_METHOD_META[acc.method];
            const active = paymentMethod === acc.method;
            return (
              <button
                key={acc.method}
                type="button"
                onClick={() => setPaymentMethod(acc.method)}
                aria-pressed={active}
                className={`group relative flex flex-col items-start gap-2 rounded-2xl border-2 p-5 text-left transition-all ${
                  active
                    ? "border-[var(--brand)] bg-[var(--brand-soft)] shadow-md shadow-[var(--brand)]/15"
                    : "border-border bg-background hover:border-[var(--brand)]/40"
                }`}
              >
                <div className="flex w-full items-center justify-between">
                  <span
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-white"
                    style={{ background: meta.color }}
                  >
                    <CreditCard className="h-5 w-5" />
                  </span>
                  <span
                    aria-hidden
                    className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors ${
                      active
                        ? "border-[var(--brand)] bg-[var(--brand)] text-white"
                        : "border-border bg-white"
                    }`}
                  >
                    {active ? <Check className="h-3 w-3" /> : null}
                  </span>
                </div>
                <span className="font-heading text-lg text-foreground">
                  {meta.label}
                </span>
                <span className="text-xs text-muted-foreground">
                  {meta.tagline}
                </span>
              </button>
            );
          })}
        </div>

        {selectedAccount ? (
          <div className="mt-6 rounded-2xl border border-[var(--brand)]/30 bg-[var(--brand-soft)] p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand)]">
              Send {formatPKR(total)} to this account
            </p>
            {selectedAccount.accountNumber ? (
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <div>
                  <p className="font-heading text-2xl text-foreground sm:text-3xl">
                    {selectedAccount.accountNumber}
                  </p>
                  <p className="text-sm text-foreground/70">
                    Account title:{" "}
                    <span className="font-medium text-foreground">
                      {selectedAccount.accountTitle}
                    </span>
                  </p>
                </div>
                <CopyButton text={selectedAccount.accountNumber} />
              </div>
            ) : (
              <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                Account number not configured yet — please contact support
                before placing this order.
              </p>
            )}
            <p className="mt-3 text-xs text-foreground/70">
              {selectedAccount.instructions}
            </p>
          </div>
        ) : null}

        <div className="mt-6">
          <Field
            label="JazzCash / EasyPaisa Transaction ID"
            required
            hint="Paste the TID after sending payment so we can match your order instantly."
            error={paymentReferenceError}
            input={
              <input
                type="text"
                value={paymentReference}
                onChange={(e) => {
                  setPaymentReference(e.target.value);
                  if (e.target.value.trim()) {
                    onClearPaymentReferenceError();
                  }
                }}
                placeholder="e.g. T2025051012345"
                className={inputClass(paymentReferenceError)}
                disabled={!paymentMethod}
              />
            }
          />
        </div>

        {submitError ? (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            {submitError}
          </div>
        ) : null}

        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={onBack}
            disabled={submitting}
            className="inline-flex items-center gap-1.5 self-start text-sm font-medium text-foreground/70 hover:text-[var(--brand)] disabled:opacity-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to shipping
          </button>
          <button
            type="button"
            onClick={onPlaceOrder}
            disabled={!paymentMethod || submitting}
            className="group inline-flex items-center justify-center gap-2 rounded-full bg-[var(--brand)] px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[var(--brand)]/25 transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Placing order…
              </>
            ) : (
              <>
                Place Order · {formatPKR(total)}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
        </div>
      </section>

      <section className="rounded-3xl border border-border bg-background p-6 shadow-sm sm:p-7">
        <h3 className="font-heading text-lg text-foreground">Shipping to</h3>
        <p className="mt-2 text-sm text-foreground/85">
          {shipping.full_name}
          <br />
          {shipping.shipping_address}
          <br />
          {shipping.city}
          {shipping.postal_code ? `, ${shipping.postal_code}` : ""}
          <br />
          {shipping.phone} · {shipping.email}
        </p>
        <button
          type="button"
          onClick={onBack}
          className="mt-3 inline-flex text-xs font-medium text-[var(--brand)] hover:underline"
        >
          Edit details
        </button>
      </section>
    </div>
  );
}

// =========================================================================
// Helpers
// =========================================================================
function inputClass(error?: string) {
  return `block w-full rounded-2xl border bg-background px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:ring-2 ${
    error
      ? "border-red-300 focus:border-red-500 focus:ring-red-100"
      : "border-border focus:border-[var(--brand)] focus:ring-[var(--brand)]/20"
  } disabled:cursor-not-allowed disabled:opacity-60`;
}

function Field({
  label,
  input,
  required,
  error,
  hint,
  className,
}: {
  label: string;
  input: React.ReactNode;
  required?: boolean;
  error?: string;
  hint?: string;
  className?: string;
}) {
  return (
    <label className={`block ${className ?? ""}`}>
      <span className="text-sm font-medium text-foreground">
        {label}
        {required ? <span className="ml-1 text-[var(--brand)]">*</span> : null}
      </span>
      <span className="mt-1.5 block">{input}</span>
      {error ? (
        <span className="mt-1 block text-xs text-red-600">{error}</span>
      ) : hint ? (
        <span className="mt-1 block text-xs text-muted-foreground">{hint}</span>
      ) : null}
    </label>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          /* clipboard blocked — silent */
        }
      }}
      className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1.5 text-xs font-semibold text-[var(--brand)] backdrop-blur transition-colors hover:bg-white"
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}
