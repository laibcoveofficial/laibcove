"use server";

import { redirect } from "next/navigation";
import { createSession } from "@/lib/auth/session";

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

  const adminEmail = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || "";

  if (!adminEmail || !adminPassword) {
    return {
      status: "error",
      message:
        "Admin credentials are not configured. Set ADMIN_EMAIL and ADMIN_PASSWORD in .env.local.",
    };
  }

  if (email !== adminEmail || password !== adminPassword) {
    return { status: "error", message: "Invalid email or password." };
  }

  await createSession(email);
  redirect(next.startsWith("/admin") ? next : "/admin");
}
