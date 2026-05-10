"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import { getSupabase } from "@/lib/supabase/server";
import {
  ORDER_STATUSES,
  PAYMENT_STATUSES,
  type Order,
  type OrderStatus,
  type PaymentStatus,
} from "@/lib/supabase/types";
import {
  sendPaymentConfirmedEmail,
  sendOrderStatusChangedEmail,
} from "@/lib/emails/order-mailer";

async function requireAdmin() {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  return session;
}

export async function updatePaymentStatus(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "") as PaymentStatus;
  const reference = String(formData.get("reference") || "").trim();
  const notes = String(formData.get("notes") || "").trim();

  if (!id || !PAYMENT_STATUSES.includes(status)) {
    throw new Error("Invalid input");
  }

  const supabase = getSupabase();

  // Load existing order to detect transitions
  const { data: existing } = await supabase
    .from("orders")
    .select(
      "id, order_number, customer_name, customer_email, total_pkr, payment_method, payment_status, order_status",
    )
    .eq("id", id)
    .maybeSingle();

  if (!existing) throw new Error("Order not found");
  const order = existing as Pick<
    Order,
    | "id"
    | "order_number"
    | "customer_name"
    | "customer_email"
    | "total_pkr"
    | "payment_method"
    | "payment_status"
    | "order_status"
  >;

  const updates: Record<string, unknown> = {
    payment_status: status,
    payment_notes: notes || null,
  };
  if (reference) updates.payment_reference = reference;
  if (status === "paid") {
    updates.payment_verified_at = new Date().toISOString();
    // Auto-advance order status to "confirmed" if still pending
    if (order.order_status === "pending") {
      updates.order_status = "confirmed";
    }
  }

  const { error } = await supabase
    .from("orders")
    .update(updates)
    .eq("id", id);
  if (error) throw new Error(error.message);

  // Audit-log a payment row
  await supabase.from("payments").insert({
    order_id: id,
    method: order.payment_method,
    status,
    amount_pkr: order.total_pkr,
    reference: reference || null,
    notes: notes || null,
  });

  // Send confirmation email when transitioning to paid
  if (status === "paid" && order.payment_status !== "paid") {
    try {
      await sendPaymentConfirmedEmail({
        orderNumber: order.order_number,
        customerName: order.customer_name,
        customerEmail: order.customer_email,
        total: Number(order.total_pkr),
        paymentMethod: order.payment_method,
      });
    } catch (err) {
      console.error("[payment confirmed email] failed:", err);
    }
  }

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath(`/orders/${order.order_number}`);
  revalidatePath(`/checkout/success/${order.order_number}`);
}

export async function updateOrderStatus(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "") as OrderStatus;

  if (!id || !ORDER_STATUSES.includes(status)) {
    throw new Error("Invalid input");
  }

  const supabase = getSupabase();
  const { data: existing } = await supabase
    .from("orders")
    .select("id, order_number, customer_name, customer_email, order_status")
    .eq("id", id)
    .maybeSingle();
  if (!existing) throw new Error("Order not found");
  const order = existing as Pick<
    Order,
    "id" | "order_number" | "customer_name" | "customer_email" | "order_status"
  >;

  const { error } = await supabase
    .from("orders")
    .update({ order_status: status })
    .eq("id", id);
  if (error) throw new Error(error.message);

  if (status !== order.order_status) {
    try {
      await sendOrderStatusChangedEmail({
        orderNumber: order.order_number,
        customerName: order.customer_name,
        customerEmail: order.customer_email,
        status,
      });
    } catch (err) {
      console.error("[status change email] failed:", err);
    }
  }

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath(`/orders/${order.order_number}`);
}
