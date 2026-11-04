import { createClient } from "npm:@supabase/supabase-js@2";
import { validateCashRequest, validateOnboarding } from "../../../onboarding-core.js";
import {
  assertOrigin,
  isUuid,
  randomToken,
  respond,
  serviceConfiguration,
  sha256Hex
} from "../_shared/http.ts";

const MAX_PROOF_BYTES = 3 * 1024 * 1024;
const ALLOWED_PROOF_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") return respond(request, {});
  if (!assertOrigin(request)) return respond(request, { error: "Origin is not allowed." }, 403);

  try {
    const { url, serviceRoleKey } = serviceConfiguration();
    const supabase = createClient(url, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    if (request.method === "GET") {
      const [packageResult, themeResult, styleResult] = await Promise.all([
        supabase.rpc("get_onboarding_packages"),
        supabase.from("themes").select("theme_name,primary_color,primary_dark_color,accent_color,paper_top_color,paper_bottom_color,text_color").order("theme_name"),
        supabase.from("styles").select("template_id,style_name").order("template_id")
      ]);
      if (packageResult.error || themeResult.error || styleResult.error) {
        throw new Error("Unable to load onboarding choices.");
      }
      const packages = Array.isArray(packageResult.data) ? packageResult.data : [];
      return respond(request, {
        packages,
        themes: themeResult.data ?? [],
        styles: styleResult.data ?? [],
        payment: {
          upi_vpa: Deno.env.get("UPI_VPA") ?? "",
          merchant_name: Deno.env.get("UPI_MERCHANT_NAME") ?? ""
        }
      });
    }
    if (request.method !== "POST") return respond(request, { error: "Method not allowed." }, 405);

    if ((request.headers.get("content-type") ?? "").includes("application/json")) {
      const declaredLength = Number(request.headers.get("content-length") ?? 0);
      if (declaredLength > 48_000) {
        return respond(request, { error: "Cash quote details exceed the allowed size." }, 413);
      }
      const reader = request.body?.getReader();
      if (!reader) return respond(request, { error: "A request body is required." }, 400);
      const chunks: Uint8Array[] = [];
      let totalBytes = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        totalBytes += value.byteLength;
        if (totalBytes > 48_000) {
          await reader.cancel();
          return respond(request, { error: "Cash quote details exceed the allowed size." }, 413);
        }
        chunks.push(value);
      }
      const bodyBytes = new Uint8Array(totalBytes);
      let offset = 0;
      for (const chunk of chunks) {
        bodyBytes.set(chunk, offset);
        offset += chunk.byteLength;
      }
      const rawBody = new TextDecoder().decode(bodyBytes);
      let cashBody: unknown;
      try {
        cashBody = JSON.parse(rawBody);
      } catch {
        return respond(request, { error: "Request must contain valid JSON." }, 400);
      }
      if (cashBody && typeof cashBody === "object" && !Array.isArray(cashBody)
          && (cashBody as Record<string, unknown>).intent === "cash_quote_request") {
        const body = cashBody as Record<string, unknown>;
        if (!body.input || typeof body.input !== "object" || Array.isArray(body.input)) {
          return respond(request, { error: "Cash quote details are required." }, 400);
        }
        const inputSize = new TextEncoder().encode(JSON.stringify(body.input)).byteLength;
        if (inputSize > 32_000) {
          return respond(request, { error: "Cash quote details exceed the allowed size." }, 413);
        }
        const validation = validateCashRequest(body.input as Record<string, unknown>);
        if (!validation.valid) {
          return respond(request, {
            error: "Please provide a contact name and a valid phone number or email address.",
            field_errors: validation.errors
          }, 400);
        }
        const idempotencyKey = request.headers.get("idempotency-key") ?? "";
        if (!isUuid(idempotencyKey)) {
          return respond(request, { error: "Invalid request key. Refresh the form and retry." }, 400);
        }
        const clientIp = request.headers.get("cf-connecting-ip")
          ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
          ?? "";
        const fingerprintSecret = Deno.env.get("RATE_LIMIT_SECRET");
        if (!clientIp || !fingerprintSecret) {
          return respond(request, { error: "Cash request service is not configured. Please contact the business directly." }, 503);
        }
        const clientFingerprint = await sha256Hex(`${fingerprintSecret}:${clientIp}`);
        const { data, error } = await supabase.rpc("submit_cash_quote_request", {
          p_input: validation.value,
          p_idempotency_key: idempotencyKey,
          p_client_fingerprint: clientFingerprint
        });
        if (error) {
          if (error.code === "P0001" && /too many requests/i.test(error.message)) {
            return respond(request, { error: "Too many requests. Please try again in an hour." }, 429);
          }
          if (error.code === "22023") return respond(request, { error: error.message }, 400);
          console.error("Cash quote request could not be saved", {
            code: error.code,
            requestKey: idempotencyKey
          });
          return respond(request, { error: "Cash quote request could not be saved. Please try again or contact the business." }, 503);
        }
        return respond(request, {
          success: true,
          request_reference: data.request_reference,
          status: data.status,
          replayed: data.replayed === true
        });
      }
      return respond(request, { error: "Request intent is not supported." }, 400);
    }

    const captchaSecret = Deno.env.get("TURNSTILE_SECRET_KEY");
    const captchaToken = request.headers.get("cf-turnstile-response") ?? "";
    if (!captchaSecret || !captchaToken) {
      return respond(request, { error: "Security verification is not configured. Please contact support." }, 503);
    }
    const captchaBody = new URLSearchParams({
      secret: captchaSecret,
      response: captchaToken,
      remoteip: request.headers.get("cf-connecting-ip") ?? ""
    });
    const captchaResponse = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: captchaBody
    });
    const captchaResult = await captchaResponse.json();
    if (!captchaResponse.ok || captchaResult.success !== true) {
      return respond(request, { error: "Security verification failed. Please try again." }, 400);
    }

    const contentType = request.headers.get("content-type") ?? "";
    const declaredLength = Number(request.headers.get("content-length") ?? 0);
    if (declaredLength > MAX_PROOF_BYTES + 256_000) {
      return respond(request, { error: "Request is too large. Payment proof images are limited to 3 MB." }, 413);
    }
    let input: unknown;
    let proof: File | null = null;
    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      const serialized = form.get("input");
      if (typeof serialized !== "string") return respond(request, { error: "Invalid request." }, 400);
      if (new TextEncoder().encode(serialized).byteLength > 1_000_000) {
        return respond(request, { error: "Onboarding details exceed the 1 MB limit." }, 413);
      }
      try {
        input = JSON.parse(serialized);
      } catch {
        return respond(request, { error: "Onboarding details must contain valid JSON." }, 400);
      }
      const uploaded = form.get("proof");
      if (uploaded instanceof File && uploaded.size > 0) proof = uploaded;
    } else {
      const rawInput = await request.text();
      if (new TextEncoder().encode(rawInput).byteLength > 1_000_000) {
        return respond(request, { error: "Onboarding details exceed the 1 MB limit." }, 413);
      }
      try {
        input = JSON.parse(rawInput);
      } catch {
        return respond(request, { error: "Onboarding details must contain valid JSON." }, 400);
      }
    }
    if (!input || typeof input !== "object" || Array.isArray(input)) {
      return respond(request, { error: "Invalid onboarding details." }, 400);
    }
    const requestData = input as Record<string, unknown>;
    const idempotencyKey = request.headers.get("idempotency-key")
      ?? String(requestData.idempotency_key ?? "");
    if (!isUuid(idempotencyKey)) return respond(request, { error: "Invalid request key. Refresh the form and retry." }, 400);

    const validation = validateOnboarding(requestData);
    if (!validation.valid) {
      return respond(request, {
        error: "Please correct the highlighted information.",
        field_errors: validation.errors
      }, 400);
    }
    if (proof && (proof.size > MAX_PROOF_BYTES || !ALLOWED_PROOF_TYPES.has(proof.type))) {
      return respond(request, { error: "Payment proof must be a JPG, PNG, or WebP image up to 3 MB." }, 400);
    }
    if (validation.value.payment_mode === "upi"
        && (!Deno.env.get("UPI_VPA") || !Deno.env.get("UPI_MERCHANT_NAME"))) {
      return respond(request, { error: "UPI payment is not configured. Choose cash or contact support." }, 503);
    }

    const clientIp = request.headers.get("cf-connecting-ip")
      ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      ?? "";
    const fingerprintSecret = Deno.env.get("RATE_LIMIT_SECRET");
    if (!clientIp || !fingerprintSecret) {
      return respond(request, { error: "Secure onboarding is not configured. Please contact support." }, 503);
    }
    const clientFingerprint = await sha256Hex(`${fingerprintSecret}:${clientIp}`);
    const dashboardToken = randomToken();
    const { data, error: provisionError } = await supabase.rpc("provision_new_customer", {
      p_input: validation.value,
      p_idempotency_key: idempotencyKey,
      p_dashboard_token: dashboardToken,
      p_client_fingerprint: clientFingerprint
    });
    if (provisionError) {
      if (provisionError.code === "P0001" && /too many requests/i.test(provisionError.message)) {
        return respond(request, { error: "Too many requests. Please try again in an hour." }, 429);
      }
      console.error("Provisioning RPC failed", {
        code: provisionError.code,
        requestKey: idempotencyKey
      });
      return respond(request, { error: "We could not create the order. Check your details and try again with the same form." }, 422);
    }

    if (data?.replayed === true) {
      return respond(request, {
        success: true,
        replayed: true,
        order_reference: data.order_reference,
        customer_id: data.customer_id,
        wedding_id: data.wedding_id,
        preview_guest_code: data.preview_guest_code,
        payment_status: data.payment_status,
        provisioning_status: data.provisioning_status,
        dashboard_access: "Use the secure link sent to your email."
      });
    }

    let proofStatus = proof ? "not_uploaded" : "not_provided";
    if (proof) {
      const extension = proof.type === "image/jpeg" ? "jpg" : proof.type === "image/png" ? "png" : "webp";
      const path = `${data.order_reference}/${crypto.randomUUID()}.${extension}`;
      const { error: uploadError } = await supabase.storage
        .from("payment-proofs")
        .upload(path, proof, { contentType: proof.type, upsert: false });
      if (!uploadError) {
        const { error: linkError } = await supabase.rpc("attach_onboarding_payment_proof", {
          p_access_token: dashboardToken,
          p_order_reference: data.order_reference,
          p_payment_id: data.payment_id,
          p_storage_path: path
        });
        if (linkError) {
          await supabase.storage.from("payment-proofs").remove([path]);
          console.error("Payment proof metadata update failed", { orderReference: data.order_reference });
        } else {
          proofStatus = "uploaded";
        }
      } else {
        console.error("Payment proof upload failed", { orderReference: data.order_reference });
      }
    }

    let notificationStatus = "pending";
    const cronSecret = Deno.env.get("OUTBOX_CRON_SECRET");
    if (cronSecret) {
      try {
        const workerResponse = await fetch(`${url}/functions/v1/process-outbox`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-cron-secret": cronSecret
          },
          body: JSON.stringify({ event_id: data.notification_event_id })
        });
        if (workerResponse.ok) {
          const workerResult = await workerResponse.json();
          notificationStatus = workerResult.status === "sent" ? "sent" : "pending";
        }
      } catch (error) {
        console.error("Initial notification processing deferred", {
          orderReference: data.order_reference,
          errorType: error instanceof Error ? error.name : "unknown"
        });
      }
    }

    return respond(request, {
      success: true,
      replayed: false,
      order_reference: data.order_reference,
      customer_id: data.customer_id,
      wedding_id: data.wedding_id,
      wedding_slug: data.wedding_slug,
      payment_status: data.payment_status,
      provisioning_status: data.provisioning_status,
      notification_status: notificationStatus,
      payment_proof_status: proofStatus,
      dashboard_token: dashboardToken,
      preview_guest_code: data.preview_guest_code,
      message: notificationStatus === "sent"
        ? "Your order is created. Payment is awaiting verification."
        : "Your order is created. Confirmation email delivery is queued."
    });
  } catch (error) {
    console.error("Onboarding request failed", {
      type: error instanceof Error ? error.name : "unknown"
    });
    return respond(request, { error: "Service is temporarily unavailable. Please try again shortly." }, 503);
  }
});
