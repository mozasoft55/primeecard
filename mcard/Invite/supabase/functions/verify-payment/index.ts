import { createClient } from "npm:@supabase/supabase-js@2";
import { assertOrigin, respond } from "../_shared/http.ts";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") return respond(request, {});
  if (request.method !== "POST") return respond(request, { error: "Method not allowed." }, 405);
  if (!assertOrigin(request)) return respond(request, { error: "Origin is not allowed." }, 403);
  const authorization = request.headers.get("authorization") ?? "";
  const accessToken = authorization.replace(/^Bearer\s+/i, "").trim();
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  if (!accessToken || !supabaseUrl || !anonKey) {
    return respond(request, { error: "Administrator session is required." }, 401);
  }

  try {
    const body = await request.json();
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    if (!supabaseUrl || !anonKey) return respond(request, { error: "Payment review is not configured." }, 503);
    const supabase = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: `Bearer ${accessToken}` } },
      auth: { autoRefreshToken: false, persistSession: false }
    });
    if (body.action === "list") {
      const { data, error } = await supabase.rpc("get_admin_payment_queue");
      if (error) {
        if (error.code === "42501") return respond(request, { error: "Administrator access is required." }, 403);
        console.error("Admin payment queue failed", { code: error.code });
        return respond(request, { error: "Payment queue could not be loaded." }, 500);
      }
      return respond(request, { success: true, payments: data });
    }
    if (body.action === "list_cash_requests") {
      const { data, error } = await supabase.rpc("get_admin_cash_quote_requests");
      if (error) {
        if (error.code === "42501") return respond(request, { error: "Administrator access is required." }, 403);
        console.error("Admin cash quote queue failed", { code: error.code });
        return respond(request, { error: "Cash quote requests could not be loaded." }, 500);
      }
      return respond(request, { success: true, cash_requests: data });
    }
    if (body.action === "update_cash_request") {
      if (!UUID_PATTERN.test(String(body.request_id ?? ""))
          || !["Contacted", "Converted", "Closed"].includes(String(body.status ?? ""))) {
        return respond(request, { error: "Cash quote request update is invalid." }, 400);
      }
      const { data, error } = await supabase.rpc("update_admin_cash_quote_request", {
        p_request_id: body.request_id,
        p_status: body.status
      });
      if (error) {
        if (error.code === "42501") return respond(request, { error: "Administrator access is required." }, 403);
        if (["22023", "P0002"].includes(error.code)) return respond(request, { error: error.message }, 400);
        console.error("Admin cash quote request update failed", { code: error.code });
        return respond(request, { error: "Cash quote request could not be updated." }, 500);
      }
      return respond(request, data);
    }
    if (body.action === "proof") {
      if (!UUID_PATTERN.test(String(body.payment_id ?? ""))) {
        return respond(request, { error: "Payment record is invalid." }, 400);
      }
      const { data: queue, error: queueError } = await supabase.rpc("get_admin_payment_queue");
      if (queueError) {
        if (queueError.code === "42501") return respond(request, { error: "Administrator access is required." }, 403);
        return respond(request, { error: "Payment proof could not be authorized." }, 500);
      }
      const payment = Array.isArray(queue) ? queue.find((item) => item.payment_id === body.payment_id) : null;
      if (!payment?.proof_storage_path) return respond(request, { error: "No proof is attached to this payment." }, 404);
      const { data: signed, error: signedError } = await createClient(
        supabaseUrl,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
        { auth: { autoRefreshToken: false, persistSession: false } }
      ).storage.from("payment-proofs").createSignedUrl(payment.proof_storage_path, 300);
      if (signedError || !signed?.signedUrl) {
        console.error("Admin payment proof URL failed", { paymentId: body.payment_id });
        return respond(request, { error: "Payment proof is temporarily unavailable." }, 500);
      }
      return respond(request, { success: true, url: signed.signedUrl, expires_in_seconds: 300 });
    }
    if (!UUID_PATTERN.test(String(body.payment_id ?? ""))
        || !["verify", "reject"].includes(String(body.decision ?? ""))) {
      return respond(request, { error: "Payment review request is invalid." }, 400);
    }
    const amount = Number(body.verified_amount_paise);
    const { data, error } = await supabase.rpc("verify_onboarding_payment", {
      p_payment_id: body.payment_id,
      p_verified_amount_paise: Number.isSafeInteger(amount) ? amount : null,
      p_decision: body.decision,
      p_rejection_reason: body.rejection_reason ?? null
    });
    if (error) {
      if (error.code === "42501") return respond(request, { error: "Administrator access is required." }, 403);
      if (["22023", "P0002"].includes(error.code)) return respond(request, { error: error.message }, 400);
      console.error("Payment verification failed", { code: error.code });
      return respond(request, { error: "Payment could not be updated." }, 500);
    }
    return respond(request, data);
  } catch (error) {
    console.error("Payment verification request failed", {
      type: error instanceof Error ? error.name : "unknown"
    });
    return respond(request, { error: "Payment review service is unavailable." }, 503);
  }
});
