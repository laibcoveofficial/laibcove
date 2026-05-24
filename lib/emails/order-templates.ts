import "server-only";
import type { OrderStatus, PaymentMethod } from "@/lib/supabase/types";

const BRAND = "#17b6d0";
const BRAND_SOFT = "#eaf8fc";
const FG = "#2f2f2f";
const MUTED = "#6b7280";
const BORDER = "#e5e7eb";

const wrap = (title: string, body: string) => `<!doctype html>
<html lang="en"><head><meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${title}</title></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:${FG};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;border:1px solid ${BORDER};overflow:hidden;">
        <tr><td style="background:${BRAND};padding:24px 32px;color:#fff;">
          <div style="font-size:12px;letter-spacing:0.18em;text-transform:uppercase;opacity:0.85;">Laibcove</div>
          <div style="font-size:22px;font-weight:600;margin-top:4px;">${title}</div>
        </td></tr>
        <tr><td style="padding:32px;">${body}</td></tr>
        <tr><td style="padding:20px 32px;background:#f8fafc;border-top:1px solid ${BORDER};color:${MUTED};font-size:12px;">
          Laibcove · Handmade crochet creations<br/>
          <a href="https://laibcove.com" style="color:${BRAND};text-decoration:none;">laibcove.com</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

const escape = (s: string | null | undefined) =>
  (s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const formatPKR = (n: number) =>
  `PKR ${Number(n).toLocaleString("en-PK", { maximumFractionDigits: 0 })}`;

const PAYMENT_LABEL: Record<PaymentMethod, string> = {
  jazzcash: "JazzCash",
  easypaisa: "EasyPaisa",
};

export type OrderEmailItem = {
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  image: string | null;
  variantName?: string | null;
};

export type OrderEmailContext = {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  city: string;
  paymentMethod: PaymentMethod;
  paymentReference: string | null;
  items: OrderEmailItem[];
  subtotal: number;
  delivery: number;
  discount: number;
  total: number;
  couponCode: string | null;
};

function itemsTable(items: OrderEmailItem[]): string {
  const rows = items
    .map(
      (it) => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid ${BORDER};vertical-align:top;">
        <div style="display:flex;align-items:flex-start;gap:12px;">
          ${
            it.image
              ? `<img src="${escape(it.image)}" alt="" width="56" height="56" style="border-radius:8px;object-fit:cover;display:block;" />`
              : ""
          }
          <div>
            <div style="font-size:14px;font-weight:600;color:${FG};">${escape(it.name)}</div>
            ${
              it.variantName
                ? `<div style="font-size:12px;color:${MUTED};margin-top:2px;">Color: ${escape(it.variantName)}</div>`
                : ""
            }
            <div style="font-size:12px;color:${MUTED};margin-top:2px;">Qty ${it.quantity} × ${formatPKR(it.unitPrice)}</div>
          </div>
        </div>
      </td>
      <td style="padding:12px 0;border-bottom:1px solid ${BORDER};vertical-align:top;text-align:right;font-size:14px;color:${FG};font-weight:600;">
        ${formatPKR(it.lineTotal)}
      </td>
    </tr>`,
    )
    .join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">${rows}</table>`;
}

function totalsTable(ctx: OrderEmailContext): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:12px;border-collapse:collapse;">
    <tr><td style="padding:6px 0;color:${MUTED};font-size:13px;">Subtotal</td><td style="padding:6px 0;text-align:right;font-size:14px;color:${FG};">${formatPKR(ctx.subtotal)}</td></tr>
    <tr><td style="padding:6px 0;color:${MUTED};font-size:13px;">Delivery</td><td style="padding:6px 0;text-align:right;font-size:14px;color:${FG};">${ctx.delivery === 0 ? "Free" : formatPKR(ctx.delivery)}</td></tr>
    ${
      ctx.discount > 0
        ? `<tr><td style="padding:6px 0;color:${MUTED};font-size:13px;">Discount${ctx.couponCode ? ` (${escape(ctx.couponCode)})` : ""}</td><td style="padding:6px 0;text-align:right;font-size:14px;color:#15803d;">−${formatPKR(ctx.discount)}</td></tr>`
        : ""
    }
    <tr><td style="padding:10px 0 0;border-top:1px solid ${BORDER};font-size:15px;font-weight:600;color:${FG};">Total</td><td style="padding:10px 0 0;border-top:1px solid ${BORDER};text-align:right;font-size:16px;font-weight:700;color:${FG};">${formatPKR(ctx.total)}</td></tr>
  </table>`;
}

export function orderReceivedCustomerEmail(ctx: OrderEmailContext) {
  const subject = `Order ${ctx.orderNumber} received — payment pending`;

  const body = `
    <p style="margin:0 0 14px;font-size:16px;color:${FG};">
      Hi ${escape(ctx.customerName.split(" ")[0] || ctx.customerName)},
    </p>

    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:${FG};">
      Thank you for shopping with Laibcove! We've received your order and we're
      now waiting for your <strong>${PAYMENT_LABEL[ctx.paymentMethod]}</strong>
      payment to clear. As soon as we confirm it, we'll send you another email
      and start preparing your piece.
    </p>

    <div style="margin:16px 0;padding:18px;background:${BRAND_SOFT};border-radius:12px;">
      <div style="font-size:12px;text-transform:uppercase;letter-spacing:0.12em;color:${BRAND};font-weight:600;">Order number</div>
      <div style="margin-top:4px;font-size:22px;font-weight:700;color:${FG};letter-spacing:0.04em;">${escape(ctx.orderNumber)}</div>
      ${
        ctx.paymentReference
          ? `<div style="margin-top:10px;font-size:12px;color:${MUTED};">Your transaction ID: <strong style="color:${FG};">${escape(ctx.paymentReference)}</strong></div>`
          : ""
      }
    </div>

    <h3 style="margin:24px 0 6px;font-size:14px;color:${FG};">Items</h3>
    ${itemsTable(ctx.items)}
    ${totalsTable(ctx)}

    <h3 style="margin:24px 0 6px;font-size:14px;color:${FG};">Shipping to</h3>
    <p style="margin:0;color:${FG};font-size:14px;line-height:1.6;">
      ${escape(ctx.customerName)}<br/>
      ${escape(ctx.shippingAddress)}<br/>
      ${escape(ctx.city)}<br/>
      ${escape(ctx.customerPhone)}
    </p>

    <p style="margin:24px 0 0;font-size:13px;color:${MUTED};">
      Need help? Reply to this email or message us on WhatsApp.
    </p>

    <p style="margin:18px 0 0;font-size:15px;color:${FG};">
      With love,<br/>
      <strong>The Laibcove Studio</strong>
    </p>
  `;
  return { subject, html: wrap("Order received", body) };
}

export function orderReceivedAdminEmail(ctx: OrderEmailContext) {
  const subject = `New order ${ctx.orderNumber} — ${formatPKR(ctx.total)} via ${PAYMENT_LABEL[ctx.paymentMethod]}`;
  const body = `
    <p style="margin:0 0 14px;font-size:15px;color:${FG};">
      A new order just came in. Verify the
      <strong>${PAYMENT_LABEL[ctx.paymentMethod]}</strong> payment, then mark it
      as <strong>Paid</strong> in the admin panel to confirm the order.
    </p>

    <div style="margin:16px 0;padding:16px;background:${BRAND_SOFT};border-radius:12px;">
      <div style="font-size:12px;text-transform:uppercase;letter-spacing:0.12em;color:${BRAND};font-weight:600;">Order</div>
      <div style="margin-top:4px;font-size:18px;font-weight:700;color:${FG};">${escape(ctx.orderNumber)}</div>
      <div style="margin-top:6px;font-size:13px;color:${MUTED};">
        ${PAYMENT_LABEL[ctx.paymentMethod]} · ${formatPKR(ctx.total)}
      </div>
      ${
        ctx.paymentReference
          ? `<div style="margin-top:6px;font-size:13px;color:${MUTED};">Buyer's TID: <strong style="color:${FG};">${escape(ctx.paymentReference)}</strong></div>`
          : `<div style="margin-top:6px;font-size:13px;color:${MUTED};">Buyer did not provide a transaction ID — they may submit it later.</div>`
      }
    </div>

    <h3 style="margin:18px 0 6px;font-size:14px;color:${FG};">Items</h3>
    ${itemsTable(ctx.items)}
    ${totalsTable(ctx)}

    <h3 style="margin:18px 0 6px;font-size:14px;color:${FG};">Customer</h3>
    <p style="margin:0;color:${FG};font-size:14px;line-height:1.6;">
      <strong>${escape(ctx.customerName)}</strong><br/>
      ${escape(ctx.customerEmail)}<br/>
      ${escape(ctx.customerPhone)}<br/>
      ${escape(ctx.shippingAddress)}, ${escape(ctx.city)}
    </p>
  `;
  return { subject, html: wrap("New order", body) };
}

export function paymentConfirmedEmail(ctx: {
  orderNumber: string;
  customerName: string;
  total: number;
  paymentMethod: PaymentMethod;
}) {
  const subject = `Payment received — order ${ctx.orderNumber} confirmed 🎉`;
  const body = `
    <p style="margin:0 0 14px;font-size:16px;color:${FG};">
      Hi ${escape(ctx.customerName.split(" ")[0] || ctx.customerName)},
    </p>

    <p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:${FG};">
      Great news — we've received your <strong>${PAYMENT_LABEL[ctx.paymentMethod]}</strong>
      payment of <strong>${formatPKR(ctx.total)}</strong>. Your order is now
      confirmed and we'll start crafting it right away. ✨
    </p>

    <div style="margin:16px 0;padding:18px;background:${BRAND_SOFT};border-radius:12px;">
      <div style="font-size:12px;text-transform:uppercase;letter-spacing:0.12em;color:${BRAND};font-weight:600;">Order confirmed</div>
      <div style="margin-top:4px;font-size:22px;font-weight:700;color:${FG};letter-spacing:0.04em;">${escape(ctx.orderNumber)}</div>
    </div>

    <p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:${FG};">
      We'll keep you posted as your piece moves through preparation, packaging,
      and shipping.
    </p>

    <p style="margin:24px 0 0;font-size:15px;color:${FG};">
      With love,<br/>
      <strong>The Laibcove Studio</strong>
    </p>
  `;
  return { subject, html: wrap("Payment confirmed", body) };
}

export function orderStatusChangedEmail(ctx: {
  orderNumber: string;
  customerName: string;
  status: OrderStatus;
}): { subject: string; html: string } | null {
  const map: Partial<Record<OrderStatus, { subject: string; lead: string }>> = {
    processing: {
      subject: `Order ${ctx.orderNumber} is being prepared`,
      lead: "Your piece is now being crafted with care. We'll let you know as soon as it ships.",
    },
    shipped: {
      subject: `Order ${ctx.orderNumber} has shipped 📦`,
      lead: "Your handmade piece is on its way! It should arrive within the next few business days.",
    },
    delivered: {
      subject: `Order ${ctx.orderNumber} delivered ✨`,
      lead: "Your order has been delivered! We hope you absolutely love it. We'd be so grateful for a quick photo or review.",
    },
    cancelled: {
      subject: `Order ${ctx.orderNumber} cancelled`,
      lead: "Your order has been cancelled. If this was unexpected or you'd like to reorder, please get in touch — we're happy to help.",
    },
  };
  const cfg = map[ctx.status];
  if (!cfg) return null;

  const body = `
    <p style="margin:0 0 14px;font-size:16px;color:${FG};">
      Hi ${escape(ctx.customerName.split(" ")[0] || ctx.customerName)},
    </p>
    <p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:${FG};">${cfg.lead}</p>
    <div style="margin:16px 0;padding:16px;background:${BRAND_SOFT};border-radius:12px;">
      <div style="font-size:12px;text-transform:uppercase;letter-spacing:0.12em;color:${BRAND};font-weight:600;">Order</div>
      <div style="margin-top:4px;font-size:18px;font-weight:700;color:${FG};">${escape(ctx.orderNumber)}</div>
    </div>
    <p style="margin:24px 0 0;font-size:15px;color:${FG};">
      With love,<br/><strong>The Laibcove Studio</strong>
    </p>
  `;
  return { subject: cfg.subject, html: wrap("Order update", body) };
}
