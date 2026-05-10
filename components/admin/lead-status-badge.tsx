import type { Lead } from "@/lib/supabase/types";

const STYLES: Record<Lead["status"], string> = {
  new: "bg-[var(--brand-soft)] text-[var(--brand)] border-[var(--brand)]/30",
  contacted: "bg-blue-50 text-blue-700 border-blue-200",
  quoted: "bg-amber-50 text-amber-700 border-amber-200",
  in_progress: "bg-purple-50 text-purple-700 border-purple-200",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-gray-100 text-gray-600 border-gray-200",
};

const LABELS: Record<Lead["status"], string> = {
  new: "New",
  contacted: "Contacted",
  quoted: "Quoted",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

export function LeadStatusBadge({ status }: { status: Lead["status"] }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${STYLES[status]}`}
    >
      {LABELS[status]}
    </span>
  );
}
