"use server";

import { redirect } from "next/navigation";
import { createSession } from "@/lib/auth/session";
import { getSupabase } from "@/lib/supabase/server";

export type LoginState = {
  status: "idle" | "error";
  message: string;
};

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const next = String(formData.get("next") || "/admin");

  if (!email || !password) {
    return { status: "error", message: "Email and password are required." };
  }

  const supabase = getSupabase();
  
  // Call the custom verify_admin function from schema.sql
  const { data, error } = await supabase.rpc('verify_admin', {
    p_email: email,
    p_password: password
  });

  if (error) {
    return { 
      status: "error", 
      message: error.message || "An error occurred during login." 
    };
  }

  // verify_admin returns a table of matching admins. 
  // If no match, it returns an empty array.
  if (!data || data.length === 0) {
    return { 
      status: "error", 
      message: "Invalid email or password." 
    };
  }

  // Login successful
  await createSession(email);
  redirect(next.startsWith("/admin") ? next : "/admin");
}
