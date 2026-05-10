import Link from "next/link";
import { ArrowRight, Users, Sparkles, Clock, CheckCircle2 } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { getSupabase } from "@/lib/supabase/server";
import type { Lead } from "@/lib/supabase/types";
import { Topbar } from "@/components/admin/topbar";
import { LeadStatusBadge } from "@/components/admin/lead-status-badge";

export const dynamic = "force-dynamic";

async function loadStats() {
  try {
    const supabase = getSupabase();
    const [{ count: total }, { count: newCount }, { count: inProgress }, { count: completed }, recent] =
      await Promise.all([
        supabase.from("leads").select("*", { count: "exact", head: true }),
        supabase
          .from("leads")
          .select("*", { count: "exact", head: true })
          .eq("status", "new"),
        supabase
          .from("leads")
          .select("*", { count: "exact", head: true })
          .eq("status", "in_progress"),
        supabase
          .from("leads")
          .select("*", { count: "exact", head: true })
          .eq("status", "completed"),
        supabase
          .from("leads")
          .select("id, full_name, email, product_types, status, created_at")
          .order("created_at", { ascending: false })
          .limit(5),
      ]);

    return {
      ok: true as const,
      total: total ?? 0,
      newCount: newCount ?? 0,
      inProgress: inProgress ?? 0,
      completed: completed ?? 0,
      recent: (recent.data ?? []) as Pick<
        Lead,
        "id" | "full_name" | "email" | "product_types" | "status" | "created_at"
      >[],
    };
  } catch (err) {
    return { ok: false as const, error: (err as Error).message };
  }
}

export default async function DashboardPage() {
  const session = await getSession();
  const stats = await loadStats();

  const cards = stats.ok
    ? [
        { label: "Total leads", value: stats.total, icon: Users, tint: "bg-[var(--brand-soft)] text-[var(--brand)]" },
        { label: "New", value: stats.newCount, icon: Sparkles, tint: "bg-blue-50 text-blue-700" },
        { label: "In progress", value: stats.inProgress, icon: Clock, tint: "bg-purple-50 text-purple-700" },
        { label: "Completed", value: stats.completed, icon: CheckCircle2, tint: "bg-emerald-50 text-emerald-700" },
      ]
    : [];

  return (
    <>
      <Topbar email={session?.email || ""} title="Dashboard" />
      <div className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <p className="text-sm text-muted-foreground">
          Welcome back. Here&apos;s a quick look at your custom-order pipeline.
        </p>

        {!stats.ok ? (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
            <p className="font-semibold">Database not connected yet.</p>
            <p className="mt-1">{stats.error}</p>
            <p className="mt-2">
              Add your Supabase credentials to <code>.env.local</code> and run
              the SQL in <code>supabase/schema.sql</code>.
            </p>
          </div>
        ) : (
          <>
            <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
              {cards.map(({ label, value, icon: Icon, tint }) => (
                <div
                  key={label}
                  className="rounded-2xl border border-border bg-background p-5"
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${tint}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="mt-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {label}
                  </p>
                  <p className="font-heading mt-1 text-3xl text-foreground">
                    {value}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-2xl border border-border bg-background">
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <div>
                  <h2 className="font-heading text-lg text-foreground">
                    Recent leads
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Latest 5 submissions from the contact form
                  </p>
                </div>
                <Link
                  href="/admin/leads"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--brand)] hover:underline"
                >
                  View all
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {stats.recent.length === 0 ? (
                <p className="px-5 py-8 text-center text-sm text-muted-foreground">
                  No leads yet. They&apos;ll appear here when customers submit
                  the contact form.
                </p>
              ) : (
                <ul className="divide-y divide-border">
                  {stats.recent.map((lead) => (
                    <li key={lead.id}>
                      <Link
                        href={`/admin/leads/${lead.id}`}
                        className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-[var(--surface-soft)]"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-foreground">
                            {lead.full_name}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {lead.product_types || "Custom design"} ·{" "}
                            {lead.email}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-3">
                          <LeadStatusBadge status={lead.status} />
                          <span className="hidden text-xs text-muted-foreground sm:inline">
                            {new Date(lead.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
