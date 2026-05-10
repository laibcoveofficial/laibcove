import "server-only";
import { Resend } from "resend";

let cached: Resend | null = null;

export function getResend(): Resend {
  if (cached) return cached;
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    throw new Error("Missing RESEND_API_KEY in .env.local");
  }
  cached = new Resend(key);
  return cached;
}

export const EMAIL_FROM =
  process.env.EMAIL_FROM || "Laibcove <onboarding@resend.dev>";
export const ADMIN_NOTIFY_EMAIL =
  process.env.ADMIN_NOTIFY_EMAIL || "laibcove@gmail.com";
