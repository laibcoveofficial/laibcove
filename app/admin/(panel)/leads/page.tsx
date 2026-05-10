import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { getSupabase } from "@/lib/supabase/server";
import { LEAD_STATUSES, type Lead } from "@/lib/supabase/types";
import { Topbar } from "@/components/admin/topbar";
import { LeadsTable } from "@/components/admin/leads-table";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<Lead["status"] | "all", string> = {
  all: "All",
  new: "New",
  contacted: "Contacted",
  quoted: "Quoted",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const session = await getSession();
  const params = await searchParams;
  const filter = (params?.status || "all") as Lead["status"] | "all";

  let leads: Lead[] = [];
  let error: string | null = null;

  try {
    const supabase = getSupabase();
    let query = supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });

    if (filter !== "all") query = query.eq("status", filter);

    const { data, error: dbError } = await query;
    if (dbError) {
      error = dbError.message;
    } else {
      leads = (data ?? []) as Lead[];
    }
  } catch (err) {
    error = (err as Error).message;
  }

  const filters: (Lead["status"] | "all")[] = ["all", ...LEAD_STATUSES];

  return (
    <>
      <Topbar email={session?.email || ""} title="Leads" />
      <div className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            All custom-order requests from the contact form.
          </p>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {filters.map((s) => {
            const active = filter === s;
            const href = s === "all" ? "/admin/leads" : `/admin/leads?status=${s}`;
            return (
              <Link
                key={s}
                href={href}
                className={`rounded-full border px-4 py-1.5 text-xs font-medium transition-all ${
                  active
                    ? "border-[var(--brand)] bg-[var(--brand)] text-white"
                    : "border-border bg-background text-foreground/70 hover:border-[var(--brand)] hover:text-[var(--brand)]"
                }`}
              >
                {STATUS_LABELS[s]}
              </Link>
            );
          })}
        </div>

        {error ? (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
            <p className="font-semibold">Couldn&apos;t load leads.</p>
            <p className="mt-1">{error}</p>
          </div>
        ) : (
          <div className="mt-6">
            <LeadsTable leads={leads} />
          </div>
        )}
      </div>
    </>
  );
}
