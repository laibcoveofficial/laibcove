"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getSupabase } from "@/lib/supabase/server";
import { LEAD_STATUSES, type Lead } from "@/lib/supabase/types";

export async function updateLeadStatus(formData: FormData) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "") as Lead["status"];

  if (!id || !LEAD_STATUSES.includes(status)) {
    throw new Error("Invalid input");
  }

  const supabase = getSupabase();
  const { error } = await supabase
    .from("leads")
    .update({ status })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath(`/admin/leads/${id}`);
  revalidatePath("/admin/leads");
  revalidatePath("/admin");
}

export async function deleteLead(formData: FormData) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const id = String(formData.get("id") || "");
  if (!id) throw new Error("Invalid input");

  const supabase = getSupabase();
  const { error } = await supabase.from("leads").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/leads");
  revalidatePath("/admin");
  redirect("/admin/leads");
}
