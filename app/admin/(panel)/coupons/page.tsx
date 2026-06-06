import Link from "next/link";
import { Plus, Pencil, TicketPercent } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { getSupabase } from "@/lib/supabase/server";
import { formatPKR, type Coupon } from "@/lib/supabase/types";
import { Topbar } from "@/components/admin/topbar";
import { CouponDeleteButton } from "@/components/admin/coupon-delete-button";
import { CouponActiveToggle } from "@/components/admin/coupon-active-toggle";
import { SaveSuccessModal } from "@/components/admin/save-success-modal";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ saved?: string; code?: string }>;

// Discount as a human label, e.g. "10%" or "PKR 500".
function discountLabel(c: Coupon): string {
  return c.type === "percent" ? `${c.value}%` : formatPKR(c.value);
}

// A short validity note based on dates relative to now.
function validityNote(c: Coupon): { label: string; tone: "muted" | "amber" } {
  const now = Date.now();
  if (c.expires_at && new Date(c.expires_at).getTime() < now) {
    return { label: "Expired", tone: "amber" };
  }
  if (c.starts_at && new Date(c.starts_at).getTime() > now) {
    return {
      label: `Starts ${new Date(c.starts_at).toLocaleDateString("en-PK", { dateStyle: "medium" })}`,
      tone: "amber",
    };
  }
  if (c.expires_at) {
    return {
      label: `Until ${new Date(c.expires_at).toLocaleDateString("en-PK", { dateStyle: "medium" })}`,
      tone: "muted",
    };
  }
  return { label: "No expiry", tone: "muted" };
}

function usageLabel(c: Coupon): string {
  return c.usage_limit === null
    ? `${c.times_used} used`
    : `${c.times_used} / ${c.usage_limit}`;
}

export default async function CouponsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await getSession();
  const sp = await searchParams;
  const savedVariant: "created" | "updated" | null =
    sp?.saved === "created"
      ? "created"
      : sp?.saved === "updated"
        ? "updated"
        : null;
  const savedCode = typeof sp?.code === "string" ? sp.code : "";

  let coupons: Coupon[] = [];
  let error: string | null = null;

  try {
    const supabase = getSupabase();
    const { data, error: dbError } = await supabase
      .from("coupons")
      .select("*")
      .order("created_at", { ascending: false });

    if (dbError) error = dbError.message;
    else coupons = (data ?? []) as Coupon[];
  } catch (err) {
    error = (err as Error).message;
  }

  return (
    <>
      <Topbar email={session?.email || ""} title="Coupons" />
      <div className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            Create discount codes customers can apply at checkout. Toggle a code
            on or off without deleting it.
          </p>
          <Link
            href="/admin/coupons/new"
            className="inline-flex items-center gap-2 rounded-full bg-[var(--brand)] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[var(--brand)]/25 transition-all hover:-translate-y-0.5"
          >
            <Plus className="h-4 w-4" />
            Add coupon
          </Link>
        </div>

        {error ? (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
            <p className="font-semibold">Couldn&apos;t load coupons.</p>
            <p className="mt-1">{error}</p>
          </div>
        ) : coupons.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-border bg-background p-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--brand-soft)] text-[var(--brand)]">
              <TicketPercent className="h-6 w-6" />
            </div>
            <p className="font-heading mt-4 text-lg text-foreground">
              No coupons yet
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Create your first discount code to run a promotion.
            </p>
            <Link
              href="/admin/coupons/new"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-[var(--brand)] px-5 py-2.5 text-sm font-semibold text-white"
            >
              <Plus className="h-4 w-4" />
              Add coupon
            </Link>
          </div>
        ) : (
          <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-background">
            <table className="hidden w-full lg:table">
              <thead className="bg-[var(--surface-soft)] text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-5 py-3.5">Code</th>
                  <th className="px-5 py-3.5">Discount</th>
                  <th className="px-5 py-3.5">Min order</th>
                  <th className="px-5 py-3.5">Usage</th>
                  <th className="px-5 py-3.5">Validity</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-sm">
                {coupons.map((c) => (
                  <CouponRow key={c.id} coupon={c} />
                ))}
              </tbody>
            </table>

            {/* Mobile cards */}
            <ul className="divide-y divide-border lg:hidden">
              {coupons.map((c) => (
                <li key={c.id}>
                  <MobileCard coupon={c} />
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {savedVariant ? (
        <SaveSuccessModal variant={savedVariant} productName={savedCode} />
      ) : null}
    </>
  );
}

function CouponRow({ coupon }: { coupon: Coupon }) {
  const validity = validityNote(coupon);
  return (
    <tr className="transition-colors hover:bg-[var(--surface-soft)]">
      <td className="px-5 py-3">
        <p className="font-mono font-semibold uppercase tracking-wider text-foreground">
          {coupon.code}
        </p>
        {coupon.description ? (
          <p className="mt-0.5 max-w-[16rem] truncate text-xs text-muted-foreground">
            {coupon.description}
          </p>
        ) : null}
      </td>
      <td className="px-5 py-3">
        <span className="font-semibold text-foreground">
          {discountLabel(coupon)}
        </span>
        {coupon.type === "percent" && coupon.max_discount_pkr ? (
          <span className="block text-xs text-muted-foreground">
            max {formatPKR(coupon.max_discount_pkr)}
          </span>
        ) : null}
      </td>
      <td className="px-5 py-3 text-foreground/85">
        {coupon.min_order_pkr > 0 ? formatPKR(coupon.min_order_pkr) : "—"}
      </td>
      <td className="px-5 py-3 text-foreground/85">{usageLabel(coupon)}</td>
      <td className="px-5 py-3">
        <span
          className={
            validity.tone === "amber"
              ? "text-amber-700"
              : "text-muted-foreground"
          }
        >
          {validity.label}
        </span>
      </td>
      <td className="px-5 py-3">
        <CouponActiveToggle id={coupon.id} active={coupon.is_active} />
      </td>
      <td className="px-5 py-3">
        <div className="flex items-center justify-end gap-1.5">
          <Link
            href={`/admin/coupons/${coupon.id}/edit`}
            aria-label="Edit"
            title="Edit"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-white text-[var(--brand)] hover:border-[var(--brand)] hover:bg-[var(--brand-soft)]"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Link>
          <CouponDeleteButton id={coupon.id} code={coupon.code} />
        </div>
      </td>
    </tr>
  );
}

function MobileCard({ coupon }: { coupon: Coupon }) {
  const validity = validityNote(coupon);
  return (
    <div className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-sm font-semibold uppercase tracking-wider text-foreground">
            {coupon.code}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {discountLabel(coupon)} off
            {coupon.min_order_pkr > 0
              ? ` · min ${formatPKR(coupon.min_order_pkr)}`
              : ""}
          </p>
          <p
            className={`mt-0.5 text-xs ${
              validity.tone === "amber"
                ? "text-amber-700"
                : "text-muted-foreground"
            }`}
          >
            {validity.label} · {usageLabel(coupon)}
          </p>
        </div>
        <CouponActiveToggle id={coupon.id} active={coupon.is_active} />
      </div>
      <div className="mt-3 flex justify-end gap-1.5">
        <Link
          href={`/admin/coupons/${coupon.id}/edit`}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-white text-[var(--brand)]"
        >
          <Pencil className="h-3.5 w-3.5" />
        </Link>
        <CouponDeleteButton id={coupon.id} code={coupon.code} />
      </div>
    </div>
  );
}
