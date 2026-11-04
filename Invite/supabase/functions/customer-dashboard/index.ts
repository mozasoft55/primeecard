import { createClient } from "npm:@supabase/supabase-js@2";
import { assertOrigin, respond, serviceConfiguration } from "../_shared/http.ts";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") return respond(request, {});
  if (request.method !== "POST") return respond(request, { error: "Method not allowed." }, 405);
  if (!assertOrigin(request)) return respond(request, { error: "Origin is not allowed." }, 403);

  const token = (request.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "").trim();
  if (token.length < 32 || token.length > 200) {
    return respond(request, { error: "Your secure dashboard link is invalid or expired." }, 401);
  }

  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (declaredLength > 1_000_000) {
    return respond(request, { error: "Dashboard request exceeds the 1 MB limit." }, 413);
  }

  let body: Record<string, unknown>;
  try {
    const rawBody = await request.text();
    if (new TextEncoder().encode(rawBody).byteLength > 1_000_000) {
      return respond(request, { error: "Dashboard request exceeds the 1 MB limit." }, 413);
    }
    const parsed: unknown = JSON.parse(rawBody);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return respond(request, { error: "Dashboard request must be a JSON object." }, 400);
    }
    body = parsed as Record<string, unknown>;
  } catch {
    return respond(request, { error: "Dashboard request must contain valid JSON." }, 400);
  }

  try {
    const { url, serviceRoleKey } = serviceConfiguration();
    const supabase = createClient(url, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });
    if (body.action === "load") {
      const { data, error } = await supabase.rpc("get_customer_dashboard", {
        p_access_token: token
      });
      if (error) {
        if (error.code === "28000") return respond(request, { error: "Your secure dashboard link is invalid or expired." }, 401);
        throw new Error("Dashboard lookup failed.");
      }
      return respond(request, { success: true, dashboard: data });
    }
    if (body.action === "add_guests") {
      if (!Array.isArray(body.guests)) return respond(request, { error: "Guest list must be an array." }, 400);
      const { data, error } = await supabase.rpc("add_dashboard_guests", {
        p_access_token: token,
        p_guests: body.guests
      });
      if (error) {
        if (error.code === "28000") return respond(request, { error: "Your secure dashboard link is invalid or expired." }, 401);
        if (error.code === "22023") return respond(request, { error: error.message }, 400);
        if (error.code === "P0001") return respond(request, { error: "Duplicate guest name and phone were found. No rows were imported." }, 409);
        return respond(request, { error: "Guest list could not be imported." }, 400);
      }
      return respond(request, data);
    }
    if (body.action === "delete_guest") {
      if (typeof body.guest_id !== "string" || !UUID_PATTERN.test(body.guest_id)) {
        return respond(request, { error: "Guest ID is invalid." }, 400);
      }
      const { data, error } = await supabase.rpc("delete_dashboard_guest", {
        p_access_token: token,
        p_guest_id: body.guest_id
      });
      if (error) {
        if (error.code === "28000") return respond(request, { error: "Your secure dashboard link is invalid or expired." }, 401);
        if (error.code === "P0002") return respond(request, { error: "Guest not found." }, 404);
        throw new Error("Guest could not be deleted.");
      }
      return respond(request, data);
    }
    if (body.action === "update_guest") {
      if (typeof body.guest_id !== "string" || !UUID_PATTERN.test(body.guest_id)
          || !body.guest || typeof body.guest !== "object" || Array.isArray(body.guest)) {
        return respond(request, { error: "Guest update request is invalid." }, 400);
      }
      const { data, error } = await supabase.rpc("update_dashboard_guest", {
        p_access_token: token,
        p_guest_id: body.guest_id,
        p_guest: body.guest
      });
      if (error) {
        if (error.code === "28000") return respond(request, { error: "Your secure dashboard link is invalid or expired." }, 401);
        if (error.code === "P0002") return respond(request, { error: "Guest not found." }, 404);
        if (error.code === "22023") return respond(request, { error: error.message }, 400);
        if (error.code === "P0001") return respond(request, { error: "Another guest already has this name and phone number." }, 409);
        throw new Error("Guest could not be updated.");
      }
      return respond(request, data);
    }
    return respond(request, { error: "Unsupported dashboard operation." }, 400);
  } catch (error) {
    console.error("Customer dashboard request failed", {
      type: error instanceof Error ? error.name : "unknown"
    });
    return respond(request, { error: "Dashboard service is temporarily unavailable." }, 503);
  }
});
