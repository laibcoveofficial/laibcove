import "server-only";

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

const row = (label: string, value: string | null | undefined) => {
  if (!value) return "";
  return `<tr>
    <td style="padding:10px 0;border-bottom:1px solid ${BORDER};color:${MUTED};font-size:13px;width:38%;vertical-align:top;">${label}</td>
    <td style="padding:10px 0;border-bottom:1px solid ${BORDER};color:${FG};font-size:14px;">${escape(value)}</td>
  </tr>`;
};

export type LeadInput = {
  full_name: string;
  email: string;
  phone: string;
  location: string | null;
  product_types: string | null;
  description: string;
  colors: string | null;
  size: string | null;
  quantity: number | null;
  budget: string | null;
  deadline: string | null;
  purpose: string | null;
  custom_text: string | null;
  material: string | null;
  contact_method: string | null;
  notes: string | null;
};

export function adminNotificationEmail(lead: LeadInput): {
  subject: string;
  html: string;
} {
  const subject = `New custom-order request — ${lead.full_name}`;

  const body = `
    <p style="margin:0 0 16px;font-size:15px;color:${FG};">
      A new custom crochet request just came in from the Contact page.
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
      ${row("Name", lead.full_name)}
      ${row("Email", lead.email)}
      ${row("Phone / WhatsApp", lead.phone)}
      ${row("Location", lead.location)}
      ${row("Product type(s)", lead.product_types)}
      ${row("Colors", lead.colors)}
      ${row("Size", lead.size)}
      ${row("Quantity", lead.quantity ? String(lead.quantity) : null)}
      ${row("Budget", lead.budget)}
      ${row("Deadline", lead.deadline)}
      ${row("Purpose", lead.purpose)}
      ${row("Material", lead.material)}
      ${row("Custom name / text", lead.custom_text)}
      ${row("Preferred contact", lead.contact_method)}
    </table>

    <div style="margin-top:24px;padding:16px;background:${BRAND_SOFT};border-radius:12px;">
      <div style="font-size:12px;text-transform:uppercase;letter-spacing:0.12em;color:${BRAND};font-weight:600;">Description</div>
      <div style="margin-top:6px;font-size:14px;line-height:1.6;color:${FG};white-space:pre-wrap;">${escape(lead.description)}</div>
    </div>

    ${
      lead.notes
        ? `<div style="margin-top:16px;padding:16px;border:1px dashed ${BORDER};border-radius:12px;">
        <div style="font-size:12px;text-transform:uppercase;letter-spacing:0.12em;color:${MUTED};font-weight:600;">Additional notes</div>
        <div style="margin-top:6px;font-size:14px;line-height:1.6;color:${FG};white-space:pre-wrap;">${escape(lead.notes)}</div>
      </div>`
        : ""
    }

    <p style="margin:24px 0 0;font-size:13px;color:${MUTED};">
      View and manage this lead in the admin panel.
    </p>
  `;

  return { subject, html: wrap("New Lead", body) };
}

export function customerConfirmationEmail(lead: LeadInput): {
  subject: string;
  html: string;
} {
  const subject = "We've received your custom crochet request 💌";

  const body = `
    <p style="margin:0 0 16px;font-size:16px;color:${FG};">
      Hi ${escape(lead.full_name.split(" ")[0] || lead.full_name)},
    </p>

    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:${FG};">
      Thank you for sharing your idea with us — we're so excited to read it!
      All the details you submitted have been booked in our system, and a
      member of our team will reach out within <strong>24 hours</strong> to
      discuss your custom crochet piece.
    </p>

    <div style="margin:20px 0;padding:18px;background:${BRAND_SOFT};border-radius:12px;">
      <div style="font-size:12px;text-transform:uppercase;letter-spacing:0.12em;color:${BRAND};font-weight:600;">Quick summary</div>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:8px;">
        ${row("Product", lead.product_types || "Custom design")}
        ${row("Description", lead.description.length > 160 ? lead.description.slice(0, 160) + "…" : lead.description)}
        ${row("Preferred contact", lead.contact_method || "Email")}
      </table>
    </div>

    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:${FG};">
      In the meantime, feel free to send any extra references or inspiration
      to <a href="mailto:laibcoveofficial@gmail.com" style="color:${BRAND};">laibcoveofficial@gmail.com</a>
      or message us on WhatsApp.
    </p>

    <p style="margin:24px 0 0;font-size:15px;color:${FG};">
      With love,<br/>
      <strong>The Laibcove Studio</strong>
    </p>
  `;

  return { subject, html: wrap("Request received", body) };
}
