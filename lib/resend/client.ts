import "server-only";
import { Resend } from "resend";

let cached: Resend | null = null;

export function getResend(): Resend {
  if (cached) return cached;
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    throw new Error("Missing RESEND_API_KEY in .env");
  }
  cached = new Resend(key);
  return cached;
}

// "From" must be an address on your verified Resend domain (laibcove.com).
// Resend cannot send FROM a Gmail address.
export const EMAIL_FROM =
  process.env.EMAIL_FROM || "Laibcove <hello@laibcove.com>";

// Replies from customers will land in laibcove@gmail.com
export const CLIENT_REPLY_TO =
  process.env.CLIENT_REPLY_TO || "laibcove@gmail.com";

// Admin order/lead notifications go here
export const ADMIN_NOTIFY_EMAIL =
  process.env.ADMIN_NOTIFY_EMAIL || "laibcoveofficial@gmail.com";
