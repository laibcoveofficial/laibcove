import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Tag,
  Palette,
  Ruler,
  Wallet,
  Hash,
  Sparkles,
  MessageCircle,
} from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { getSupabase } from "@/lib/supabase/server";
import type { Lead } from "@/lib/supabase/types";
import { Topbar } from "@/components/admin/topbar";
import { LeadStatusBadge } from "@/components/admin/lead-status-badge";
import { StatusUpdater } from "@/components/admin/status-updater";
import { LeadDeleteButton } from "@/components/admin/lead-delete-button";

export const dynamic = "force-dynamic";

const fmtDateTime = (s: string) =>
  new Date(s).toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

function Field({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number | null | undefined;
}) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border bg-[var(--surface-soft)] p-3.5">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-[var(--brand)]">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="mt-0.5 truncate text-sm font-medium text-foreground">
          {value}
        </p>
      </div>
    </div>
  );
}

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  const { id } = await params;

  let lead: Lead | null = null;
  let error: string | null = null;

  try {
    const supabase = getSupabase();
    const { data, error: dbError } = await supabase
      .from("leads")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (dbError) error = dbError.message;
    else lead = data as Lead | null;
  } catch (err) {
    error = (err as Error).message;
  }

  if (!error && !lead) notFound();

  return (
    <>
      <Topbar email={session?.email || ""} title="Lead Details" />
      <div className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/admin/leads"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-[var(--brand)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to leads
        </Link>

        {error ? (
          <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
            <p className="font-semibold">Couldn&apos;t load this lead.</p>
            <p className="mt-1">{error}</p>
          </div>
        ) : lead ? (
          <div className="mt-5 grid gap-5 lg:grid-cols-3">
            <div className="space-y-5 lg:col-span-2">
              <div className="rounded-2xl border border-border bg-background p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-heading text-2xl text-foreground">
                      {lead.full_name}
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Submitted {fmtDateTime(lead.created_at)}
                    </p>
                  </div>
                  <LeadStatusBadge status={lead.status} />
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <a
                    href={`mailto:${lead.email}`}
                    className="inline-flex items-center gap-1.5 rounded-full bg-[var(--brand)] px-4 py-2 text-xs font-semibold text-white shadow-sm shadow-[var(--brand)]/25 transition-transform hover:-translate-y-0.5"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    Email
                  </a>
                  <a
                    href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-4 py-2 text-xs font-semibold text-foreground transition-colors hover:border-[var(--brand)] hover:text-[var(--brand)]"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    WhatsApp
                  </a>
                  <a
                    href={`tel:${lead.phone}`}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-4 py-2 text-xs font-semibold text-foreground transition-colors hover:border-[var(--brand)] hover:text-[var(--brand)]"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    Call
                  </a>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-background p-6">
                <h3 className="font-heading text-lg text-foreground">
                  Project description
                </h3>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-foreground/85">
                  {lead.description}
                </p>
                {lead.notes ? (
                  <>
                    <div className="mt-5 border-t border-border pt-5">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Additional notes
                      </p>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground/85">
                        {lead.notes}
                      </p>
                    </div>
                  </>
                ) : null}
              </div>

              <div className="rounded-2xl border border-border bg-background p-6">
                <h3 className="font-heading text-lg text-foreground">
                  Specifications
                </h3>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <Field icon={Tag} label="Product type(s)" value={lead.product_types} />
                  <Field icon={Palette} label="Colors" value={lead.colors} />
                  <Field icon={Ruler} label="Size" value={lead.size} />
                  <Field icon={Hash} label="Quantity" value={lead.quantity} />
                  <Field icon={Wallet} label="Budget" value={lead.budget} />
                  <Field icon={Calendar} label="Deadline" value={lead.deadline} />
                  <Field icon={Sparkles} label="Purpose" value={lead.purpose} />
                  <Field icon={Tag} label="Material" value={lead.material} />
                  <Field icon={Tag} label="Custom name / text" value={lead.custom_text} />
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <div className="rounded-2xl border border-border bg-background p-6">
                <h3 className="font-heading text-base text-foreground">
                  Update status
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Move the lead through your pipeline.
                </p>
                <div className="mt-4">
                  <StatusUpdater id={lead.id} current={lead.status} />
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-background p-6">
                <h3 className="font-heading text-base text-foreground">
                  Contact details
                </h3>
                <ul className="mt-4 space-y-3 text-sm">
                  <li className="flex items-start gap-3">
                    <Mail className="mt-0.5 h-4 w-4 shrink-0 text-[var(--brand)]" />
                    <a
                      href={`mailto:${lead.email}`}
                      className="break-all text-foreground hover:text-[var(--brand)]"
                    >
                      {lead.email}
                    </a>
                  </li>
                  <li className="flex items-start gap-3">
                    <Phone className="mt-0.5 h-4 w-4 shrink-0 text-[var(--brand)]" />
                    <span className="text-foreground">{lead.phone}</span>
                  </li>
                  {lead.location ? (
                    <li className="flex items-start gap-3">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[var(--brand)]" />
                      <span className="text-foreground">{lead.location}</span>
                    </li>
                  ) : null}
                  {lead.contact_method ? (
                    <li className="flex items-start gap-3">
                      <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--brand)]" />
                      <span className="text-foreground">
                        Prefers: {lead.contact_method}
                      </span>
                    </li>
                  ) : null}
                </ul>
              </div>

              <div className="rounded-2xl border border-red-200 bg-red-50/50 p-6">
                <h3 className="font-heading text-base text-red-800">
                  Danger zone
                </h3>
                <p className="mt-1 text-xs text-red-700/80">
                  Deletes this lead permanently. Cannot be undone.
                </p>
                <div className="mt-4">
                  <LeadDeleteButton
                    id={lead.id}
                    name={lead.full_name}
                    variant="labeled"
                  />
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}
