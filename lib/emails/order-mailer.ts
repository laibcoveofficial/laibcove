import "server-only";
import {
  ADMIN_NOTIFY_EMAIL,
  CLIENT_REPLY_TO,
  EMAIL_FROM,
  getResend,
} from "@/lib/resend/client";
import {
  orderReceivedCustomerEmail,
  orderReceivedAdminEmail,
  paymentConfirmedEmail,
  orderStatusChangedEmail,
  type OrderEmailContext,
} from "./order-templates";
import type { OrderStatus, PaymentMethod } from "@/lib/supabase/types";

export async function sendOrderReceivedEmails(ctx: OrderEmailContext) {
  const resend = getResend();

  const customer = orderReceivedCustomerEmail(ctx);
  const admin = orderReceivedAdminEmail(ctx);

  await Promise.allSettled([
    // Customer confirmation — from hello@laibcove.com, reply-to laibcove@gmail.com
    resend.emails.send({
      from: EMAIL_FROM,
      to: ctx.customerEmail,
      replyTo: CLIENT_REPLY_TO,
      subject: customer.subject,
      html: customer.html,
    }),
    // Admin notification — from hello@laibcove.com, to laibcoveofficial@gmail.com
    resend.emails.send({
      from: EMAIL_FROM,
      to: ADMIN_NOTIFY_EMAIL,
      replyTo: ctx.customerEmail, // admin can directly reply to the customer
      subject: admin.subject,
      html: admin.html,
    }),
  ]);
}

export async function sendPaymentConfirmedEmail(ctx: {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  total: number;
  paymentMethod: PaymentMethod;
}) {
  const resend = getResend();
  const tpl = paymentConfirmedEmail(ctx);
  await resend.emails.send({
    from: EMAIL_FROM,
    to: ctx.customerEmail,
    replyTo: CLIENT_REPLY_TO,
    subject: tpl.subject,
    html: tpl.html,
  });
}

export async function sendOrderStatusChangedEmail(ctx: {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  status: OrderStatus;
}) {
  const resend = getResend();
  const tpl = orderStatusChangedEmail(ctx);
  if (!tpl) return; // some statuses don't notify
  await resend.emails.send({
    from: EMAIL_FROM,
    to: ctx.customerEmail,
    replyTo: CLIENT_REPLY_TO,
    subject: tpl.subject,
    html: tpl.html,
  });
}
