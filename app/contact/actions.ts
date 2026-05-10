"use server";

import { getSupabase } from "@/lib/supabase/server";
import { getResend, EMAIL_FROM, ADMIN_NOTIFY_EMAIL } from "@/lib/resend/client";
import {
  adminNotificationEmail,
  customerConfirmationEmail,
  type LeadInput,
} from "@/lib/emails/templates";

export type ContactFormState = {
  status: "idle" | "success" | "error";
  message: string;
};

const text = (v: FormDataEntryValue | null) =>
  typeof v === "string" ? v.trim() : "";

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function submitCustomOrder(
  _prev: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const lead: LeadInput = {
    full_name: text(formData.get("fullName")),
    email: text(formData.get("email")),
    phone: text(formData.get("phone")),
    location: text(formData.get("location")) || null,
    product_types: text(formData.get("productTypes")) || null,
    description: text(formData.get("description")),
    colors: text(formData.get("colors")) || null,
    size: text(formData.get("size")) || null,
    quantity: Number(text(formData.get("quantity"))) || 1,
    budget: text(formData.get("budget")) || null,
    deadline: text(formData.get("deadline")) || null,
    purpose: text(formData.get("purpose")) || null,
    custom_text: text(formData.get("customText")) || null,
    material: text(formData.get("material")) || null,
    contact_method: text(formData.get("contactMethod")) || null,
    notes: text(formData.get("notes")) || null,
  };

  if (!lead.full_name || !lead.email || !lead.phone || !lead.description) {
    return {
      status: "error",
      message:
        "Please fill in your name, email, phone, and a description of your idea.",
    };
  }
  if (!emailRe.test(lead.email)) {
    return { status: "error", message: "Please enter a valid email address." };
  }

  // Insert into Supabase
  try {
    const supabase = getSupabase();
    const { error } = await supabase.from("leads").insert(lead);
    if (error) {
      console.error("[contact] supabase insert failed:", error);
      return {
        status: "error",
        message:
          "Sorry — we couldn't save your request. Please try again or email us directly at laibcove@gmail.com.",
      };
    }
  } catch (err) {
    console.error("[contact] supabase client error:", err);
    return {
      status: "error",
      message:
        "Sorry — something went wrong on our end. Please try again or email us at laibcove@gmail.com.",
    };
  }

  // Send notification + confirmation emails. Best-effort: don't fail the
  // whole submission if Resend is misconfigured.
  try {
    const resend = getResend();
    const adminMail = adminNotificationEmail(lead);
    const customerMail = customerConfirmationEmail(lead);

    await Promise.allSettled([
      resend.emails.send({
        from: EMAIL_FROM,
        to: ADMIN_NOTIFY_EMAIL,
        replyTo: lead.email,
        subject: adminMail.subject,
        html: adminMail.html,
      }),
      resend.emails.send({
        from: EMAIL_FROM,
        to: lead.email,
        subject: customerMail.subject,
        html: customerMail.html,
      }),
    ]);
  } catch (err) {
    console.error("[contact] email send failed:", err);
    // Lead is saved — proceed with success.
  }

  return {
    status: "success",
    message:
      "Thank you! Your custom request has been received. We'll reach out within 24 hours to discuss the details.",
  };
}
