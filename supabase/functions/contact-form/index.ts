// Supabase Edge Function: contact-form
//
// Receives the PAC website's contact form as JSON, validates it,
// and inserts a row into public.contact_submissions using the
// service role key (so the table itself stays locked down behind
// Row Level Security -- see supabase/migrations/*_create_contact_submissions.sql).
//
// Deploy with:
//   supabase functions deploy contact-form
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

const VALID_REASONS = new Set([
  "general",
  "rsvp",
  "join",
  "mailing-list",
  "resources",
  "volunteer",
  "other",
]);

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
  // Bots that auto-fill every field will trip it. Pretend success
  // so the bot doesn't learn anything, but skip the insert.
  if (typeof body._gotcha === "string" && body._gotcha.trim() !== "") {
    return jsonResponse({ ok: true }, 200);
  }

  const firstName = typeof body.firstName === "string" ? body.firstName.trim() : "";
  const lastName = typeof body.lastName === "string" ? body.lastName.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const reason = typeof body.reason === "string" ? body.reason.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";
  const mailingListOptIn = body.mailingList === "yes" || body.mailingList === true;

  if (!firstName || !lastName || !email || !reason || !message) {
    return jsonResponse({ error: "Please fill in all required fields." }, 400);
  }

  if (!EMAIL_PATTERN.test(email)) {
    return jsonResponse({ error: "Please enter a valid email address." }, 400);
  }

  if (!VALID_REASONS.has(reason)) {
    return jsonResponse({ error: "Please choose a valid reason for contact." }, 400);
  }

  if (firstName.length > 200 || lastName.length > 200 || email.length > 320 || message.length > 5000) {
    return jsonResponse({ error: "One of the fields is too long." }, 400);
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );

  const { error } = await supabase.from("contact_submissions").insert({
    first_name: firstName,
    last_name: lastName,
    email,
    reason,
    message,
    mailing_list_opt_in: mailingListOptIn,
  });

  if (error) {
    console.error("contact-form insert error:", error);
    return jsonResponse({ error: "We couldn't save your message. Please try again." }, 500);
  }

  return jsonResponse({ ok: true }, 200);
});
