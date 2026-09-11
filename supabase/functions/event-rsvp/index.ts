// Supabase Edge Function: event-rsvp
//
// Receives an RSVP from the PAC website's events page as JSON,
// validates it, and upserts a row into public.event_rsvps using
// the service role key (so the table itself stays locked down
// behind Row Level Security -- see
// supabase/migrations/*_create_event_rsvps.sql).
//
// Resubmitting the same email for the same event UPDATES that
// person's RSVP (guest count, notes) rather than creating a
// duplicate row, via the unique (event_id, email) constraint.
//
// Deploy with:
//   supabase functions deploy event-rsvp
//
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are provided
// automatically to every Edge Function -- no need to set them
// yourself as secrets.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// If you'd rather lock this down to just your domain, change "*" to
// "https://icfpac.org" (and add "https://www.icfpac.org" as a second
// allowed origin if you serve both).
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function jsonResponse(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  // Honeypot field: real visitors never see or fill this input.
  if (typeof body._gotcha === "string" && body._gotcha.trim() !== "") {
    return jsonResponse({ ok: true }, 200);
  }

  const eventId = typeof body.eventId === "string" ? body.eventId.trim() : "";
  const eventName = typeof body.eventName === "string" ? body.eventName.trim() : "";
  const firstName = typeof body.firstName === "string" ? body.firstName.trim() : "";
  const lastName = typeof body.lastName === "string" ? body.lastName.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const notes = typeof body.notes === "string" ? body.notes.trim() : "";

  const guestsRaw = body.guests;
  const guestCount = typeof guestsRaw === "number" ? guestsRaw : parseInt(String(guestsRaw), 10);

  if (!eventId || !eventName || !firstName || !lastName || !email) {
    return jsonResponse({ error: "Please fill in all required fields." }, 400);
  }

  if (!EMAIL_PATTERN.test(email)) {
    return jsonResponse({ error: "Please enter a valid email address." }, 400);
  }

  if (!Number.isFinite(guestCount) || guestCount < 1 || guestCount > 20) {
    return jsonResponse({ error: "Number of guests must be between 1 and 20." }, 400);
  }

  if (
    eventId.length > 100 ||
    eventName.length > 200 ||
    firstName.length > 200 ||
    lastName.length > 200 ||
    email.length > 320 ||
    notes.length > 2000
  ) {
    return jsonResponse({ error: "One of the fields is too long." }, 400);
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );

  const { error } = await supabase.from("event_rsvps").upsert(
    {
      event_id: eventId,
      event_name: eventName,
      first_name: firstName,
      last_name: lastName,
      email,
      guest_count: guestCount,
      notes: notes || null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "event_id,email" },
  );

  if (error) {
    console.error("event-rsvp upsert error:", error);
    return jsonResponse({ error: "We couldn't save your RSVP. Please try again." }, 500);
  }

  return jsonResponse({ ok: true }, 200);
});
