import { notFound } from "next/navigation";
import { Topbar } from "@/components/admin/topbar";
import { getSession } from "@/lib/auth/session";
import { getSupabase } from "@/lib/supabase/server";
import { CouponForm } from "@/components/admin/coupon-form";
import { type Coupon } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

export default async function EditCouponPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();

  const supabase = getSupabase();
  const { data: coupon } = await supabase
    .from("coupons")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!coupon) notFound();

  return (
    <>
      <Topbar email={session?.email || ""} title="Edit Coupon" />
      <div className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <header className="mb-8">
            <h1 className="font-heading text-3xl text-foreground">
              Edit Coupon
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Update the <span className="font-semibold">{coupon.code}</span>{" "}
              discount code.
            </p>
          </header>

          <CouponForm coupon={coupon as Coupon} />
        </div>
      </div>
    </>
  );
}
