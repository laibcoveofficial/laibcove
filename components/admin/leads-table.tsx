import Link from "next/link";
import { Eye, Mail } from "lucide-react";
import { LeadStatusBadge } from "@/components/admin/lead-status-badge";
import { LeadDeleteButton } from "@/components/admin/lead-delete-button";
import type { Lead } from "@/lib/supabase/types";

const fmtDate = (s: string) =>
  new Date(s).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

function RowActions({
  lead,
  size = "md",
}: {
  lead: Lead;
  size?: "sm" | "md";
}) {
  const btn =
    size === "sm"
      ? "inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-white transition-colors"
      : "inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-white transition-colors";
  const icon = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";

  return (
    <div className="flex items-center gap-1.5">
      <Link
        href={`/admin/leads/${lead.id}`}
        aria-label={`View lead from ${lead.full_name}`}
        title="View"
        className={`${btn} text-[var(--brand)] hover:border-[var(--brand)] hover:bg-[var(--brand-soft)]`}
      >
        <Eye className={icon} />
      </Link>
      <a
        href={`mailto:${lead.email}?subject=${encodeURIComponent(
          "Re: your custom crochet request",
        )}`}
        aria-label={`Email ${lead.full_name}`}
        title="Email"
        className={`${btn} text-foreground/70 hover:border-[var(--brand)] hover:text-[var(--brand)]`}
      >
        <Mail className={icon} />
      </a>
      <LeadDeleteButton id={lead.id} name={lead.full_name} />
    </div>
  );
}

export function LeadsTable({ leads }: { leads: Lead[] }) {
  if (leads.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-background p-10 text-center">
        <p className="font-heading text-lg text-foreground">No leads yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          When someone submits the contact form, they&apos;ll show up here.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-background">
      {/* Mobile: cards */}
      <ul className="divide-y divide-border lg:hidden">
        {leads.map((lead) => (
          <li key={lead.id} className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">
                  {lead.full_name}
                </p>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {lead.email} · {lead.phone}
                </p>
                <p className="mt-2 line-clamp-2 text-xs text-foreground/80">
                  {lead.product_types || "Custom design"}
                  {lead.budget ? ` · ${lead.budget}` : ""}
                </p>
                <p className="mt-2 text-[11px] text-muted-foreground">
                  {fmtDate(lead.created_at)}
                </p>
              </div>
              <LeadStatusBadge status={lead.status} />
            </div>
            <div className="mt-4 flex items-center justify-end">
              <RowActions lead={lead} size="sm" />
            </div>
          </li>
        ))}
      </ul>

      {/* Desktop: table */}
      <table className="hidden w-full lg:table">
        <thead className="bg-[var(--surface-soft)] text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          <tr>
            <th className="px-5 py-3.5">Customer</th>
            <th className="px-5 py-3.5">Project</th>
            <th className="px-5 py-3.5">Budget</th>
            <th className="px-5 py-3.5">Status</th>
            <th className="px-5 py-3.5">Date</th>
            <th className="px-5 py-3.5 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border text-sm">
          {leads.map((lead) => (
            <tr
              key={lead.id}
              className="transition-colors hover:bg-[var(--surface-soft)]"
            >
              <td className="px-5 py-4">
                <p className="font-semibold text-foreground">{lead.full_name}</p>
                <p className="text-xs text-muted-foreground">{lead.email}</p>
              </td>
              <td className="px-5 py-4 text-foreground/85">
                <p className="line-clamp-1">
                  {lead.product_types || "Custom design"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {lead.purpose || "—"}
                </p>
              </td>
              <td className="px-5 py-4 text-foreground/85">
                {lead.budget || "—"}
              </td>
              <td className="px-5 py-4">
                <LeadStatusBadge status={lead.status} />
              </td>
              <td className="px-5 py-4 text-xs text-muted-foreground">
                {fmtDate(lead.created_at)}
              </td>
              <td className="px-5 py-4">
                <div className="flex justify-end">
                  <RowActions lead={lead} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
