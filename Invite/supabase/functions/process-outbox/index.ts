import { createClient } from "npm:@supabase/supabase-js@2";
import { assertOrigin, respond, serviceConfiguration } from "../_shared/http.ts";

type OutboxEvent = {
  event_id: string;
  order_reference: string;
  payload: Record<string, unknown>;
  attempts: number;
};

const escapeHtml = (value: unknown) => String(value ?? "").replace(/[&<>"']/g, (character) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  "\"": "&quot;",
  "'": "&#39;"
}[character] ?? character));

function inr(paise: unknown): string {
  const value = Number(paise);
  if (!Number.isSafeInteger(value) || value < 0) return "Not available";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR"
  }).format(value / 100);
}

async function sendEmail(input: {
  to: string;
  subject: string;
  html: string;
  idempotencyKey: string;
}): Promise<string> {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  const from = Deno.env.get("FROM_EMAIL");
  if (!apiKey || !from) throw new Error("Email provider configuration is missing.");
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": input.idempotencyKey
    },
    body: JSON.stringify({
      from,
      to: [input.to],
      subject: input.subject,
      html: input.html
    })
  });
  const result = await response.json();
  if (!response.ok || typeof result.id !== "string") {
    throw new Error("Email provider rejected the message.");
  }
  return result.id;
}

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") return respond(request, {});
  if (request.method !== "POST") return respond(request, { error: "Method not allowed." }, 405);
  if (assertOrigin(request)) return respond(request, { error: "Worker endpoint is not browser accessible." }, 403);

  const expectedSecret = Deno.env.get("OUTBOX_CRON_SECRET");
  if (!expectedSecret || request.headers.get("x-cron-secret") !== expectedSecret) {
    return respond(request, { error: "Unauthorized." }, 401);
  }

  try {
    const { url, serviceRoleKey } = serviceConfiguration();
    const supabase = createClient(url, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });
    const body = await request.json();
    let requestedEventId: string | null = null;
    if (typeof body?.event_id === "string") requestedEventId = body.event_id;
    const { data: claimed, error: claimError } = await supabase.rpc("claim_notification_outbox", {
      p_event_id: requestedEventId
    });
    if (claimError) throw new Error("Unable to claim notification.");
    const event = (Array.isArray(claimed) ? claimed[0] : null) as OutboxEvent | null;
    if (!event) return respond(request, { success: true, status: "empty" });

    const data = event.payload;
    const baseUrl = (Deno.env.get("APP_BASE_URL") ?? "").replace(/\/+$/, "");
    const adminEmail = Deno.env.get("ADMIN_EMAIL") ?? "";
    const adminPanelUrl = Deno.env.get("ADMIN_PANEL_URL") ?? `${baseUrl}/admin/`;
    const customerEmail = String(data.email ?? "");
    const dashboardToken = String(data.dashboard_token ?? "");
    const dashboardUrl = `${baseUrl}/dashboard/?order=${encodeURIComponent(event.order_reference)}&token=${encodeURIComponent(dashboardToken)}`;
    const previewUrl = data.preview_guest_code
      ? `${baseUrl}/?code=${encodeURIComponent(String(data.preview_guest_code))}`
      : `${baseUrl}/share.html?id=${encodeURIComponent(String(data.wedding_id ?? ""))}`;
    if (!baseUrl || !adminEmail || !customerEmail || !dashboardToken) {
      throw new Error("Email delivery configuration or outbox content is incomplete.");
    }

    const customerName = escapeHtml(data.customer_name);
    const orderRef = escapeHtml(event.order_reference);
    const paymentStatus = escapeHtml(data.payment_status);
    const paymentMode = escapeHtml(data.payment_mode);
    const amountExpected = inr(data.advance_expected_paise);
    const amountVerified = inr(data.advance_verified_paise);
    const balance = inr(data.balance_paise);
    const listPrice = inr(data.list_price_paise);
    const discount = inr(data.discount_paise);
    const utr = data.utr ? escapeHtml(data.utr) : "Not provided";
    const couple = `${escapeHtml(data.bride_name)} &amp; ${escapeHtml(data.groom_name)}`;
    const common = `
      <div style="font-family:Georgia,serif;color:#3b1a1f;max-width:640px;margin:auto;padding:24px">
        <h1 style="color:#7a1426">Wedding order ${orderRef}</h1>
        <p>Couple: ${couple}</p>
        <p>Wedding slug: ${escapeHtml(data.wedding_slug)}</p>
        <p>Wedding date: ${escapeHtml(data.event_date)}</p>
        <p>Package: ${escapeHtml(data.package_name)}</p>
        <p>List price: ${listPrice}</p>
        <p>Discount: ${discount}</p>
        <p>Advance expected: ${amountExpected}</p>
        <p>Verified amount received: ${amountVerified}</p>
        <p>Outstanding balance: ${balance}</p>
        <p>Payment mode: ${paymentMode}</p>
        <p>Payment status: <strong>${paymentStatus}</strong></p>
      </div>`;
    const adminHtml = `
      <h2>New customer order</h2>
      <p>Customer: ${customerName}</p>
      <p>Phone: ${escapeHtml(data.phone)}</p>
      <p>City: ${escapeHtml(data.city)}</p>
      <p>Customer reference: ${escapeHtml(data.customer_id)}</p>
      <p>UTR: ${utr}</p>
      ${common}
      <p><a href="${escapeHtml(adminPanelUrl)}">Open admin panel</a></p>
      <p><a href="${escapeHtml(previewUrl)}">Preview invitation</a></p>`;
    const customerHtml = `
      <h2>Thank you, ${customerName}</h2>
      <p>Your order has been provisioned. UPI claims are not considered received until verified by our team.</p>
      ${common}
      <p><a href="${escapeHtml(dashboardUrl)}">Open your secure customer dashboard</a></p>
      <p>If you selected cash, payment remains pending cash verification.</p>`;

    let adminMessageId: string;
    let customerMessageId: string;
    try {
      [adminMessageId, customerMessageId] = await Promise.all([
        sendEmail({
          to: adminEmail,
          subject: `New wedding order ${event.order_reference}`,
          html: adminHtml,
          idempotencyKey: `${event.event_id}-admin`
        }),
        sendEmail({
          to: customerEmail,
          subject: `Your wedding-card order ${event.order_reference}`,
          html: customerHtml,
          idempotencyKey: `${event.event_id}-customer`
        })
      ]);
    } catch {
      await supabase.rpc("finish_notification_outbox", {
        p_event_id: event.event_id,
        p_success: false,
        p_provider_message_ids: {},
        p_error: "Provider delivery failed; retry scheduled."
      });
      return respond(request, { success: false, status: "pending_retry" }, 503);
    }
    const { error: finishError } = await supabase.rpc("finish_notification_outbox", {
      p_event_id: event.event_id,
      p_success: true,
      p_provider_message_ids: { admin: adminMessageId, customer: customerMessageId },
      p_error: null
    });
    if (finishError) throw new Error("Unable to acknowledge notification delivery.");
    return respond(request, { success: true, status: "sent", event_id: event.event_id });
  } catch (error) {
    console.error("Notification processing failed", {
      type: error instanceof Error ? error.name : "unknown"
    });
    return respond(request, { success: false, status: "pending_retry" }, 503);
  }
});
