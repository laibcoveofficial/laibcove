"use client";

import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import { LEAD_STATUSES, type Lead } from "@/lib/supabase/types";
import { updateLeadStatus } from "@/app/admin/(panel)/leads/[id]/actions";

const LABELS: Record<Lead["status"], string> = {
  new: "New",
  contacted: "Contacted",
  quoted: "Quoted",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

export function StatusUpdater({
  id,
  current,
}: {
  id: string;
  current: Lead["status"];
}) {
  const [pending, start] = useTransition();

  return (
    <div className="flex items-center gap-2">
      <select
        defaultValue={current}
        disabled={pending}
        onChange={(e) => {
          const next = e.target.value as Lead["status"];
          if (next === current) return;
          const fd = new FormData();
          fd.set("id", id);
          fd.set("status", next);
          start(() => {
            updateLeadStatus(fd);
          });
        }}
        className="rounded-xl border border-border bg-white px-3 py-2 text-sm font-medium text-foreground outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/20"
      >
        {LEAD_STATUSES.map((s) => (
          <option key={s} value={s}>
            {LABELS[s]}
          </option>
        ))}
      </select>
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin text-[var(--brand)]" />
      ) : null}
    </div>
  );
}
