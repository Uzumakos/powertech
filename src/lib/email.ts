import "server-only";

// Transactional email through Resend's HTTP API. Optional: without
// RESEND_API_KEY and RESEND_FROM nothing is sent and requests are still saved.

const escape = (text: string) =>
  text.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]!);

/** Plain text → simple, readable HTML (paragraphs and line breaks). */
export function textToHtml(text: string): string {
  return text
    .split(/\n{2,}/)
    .map((paragraph) => `<p style="margin:0 0 14px">${escape(paragraph).replace(/\n/g, "<br>")}</p>`)
    .join("");
}

export function rowsToHtml(title: string, rows: [string, string | null | undefined][]): string {
  const body = rows
    .filter(([, value]) => value)
    .map(
      ([label, value]) =>
        `<tr><td style="padding:6px 16px 6px 0;color:#475569;vertical-align:top;white-space:nowrap">${escape(label)}</td><td style="padding:6px 0;color:#0f172a">${escape(String(value)).replace(/\n/g, "<br>")}</td></tr>`,
    )
    .join("");
  return `<h2 style="font:700 18px Arial,sans-serif;color:#9e1b1e;margin:0 0 12px">${escape(title)}</h2><table style="font:14px Arial,sans-serif;border-collapse:collapse">${body}</table>`;
}

export async function sendEmail({ to, subject, html, replyTo }: { to: string | null | undefined; subject: string; html: string; replyTo?: string | null }) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  if (!key || !from || !to) return;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [to],
        subject,
        html: `<div style="font:15px/1.55 Arial,sans-serif;color:#0f172a;max-width:600px">${html}</div>`,
        ...(replyTo ? { reply_to: replyTo } : {}),
      }),
    });
    if (!response.ok) console.error("Email not sent", response.status, await response.text());
  } catch (error) {
    console.error("Email not sent", error);
  }
}

/** Where new requests are announced: the admin setting, then the env fallback. */
export function salesInbox(notificationEmail: string | null): string | null {
  return notificationEmail || process.env.SALES_EMAIL || null;
}
