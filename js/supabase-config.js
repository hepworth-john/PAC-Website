// Configuration for the site's Supabase Edge Functions (contact
// form + event RSVPs). See supabase/README.md for the full setup
// walkthrough for each function.
//
//   SUPABASE_FUNCTION_URL / SUPABASE_EVENT_RSVP_URL -- Project
//     Settings > API > Project URL, with "/functions/v1/<name>"
//     appended for each deployed function.
//
//   SUPABASE_ANON_KEY -- Project Settings > API > "anon" "public"
//     key. This key is meant to be public/embedded in client-side
//     code -- Row Level Security blocks it from reading or writing
//     any table directly. It's only used here to prove to Supabase
//     that the request is coming from a real client.
const SUPABASE_FUNCTION_URL = "https://iqikfwhjohuoentncwxi.supabase.co/functions/v1/contact-form";
const SUPABASE_EVENT_RSVP_URL = "https://iqikfwhjohuoentncwxi.supabase.co/functions/v1/event-rsvp";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxaWtmd2hqb2h1b2VudG5jd3hpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkwNjMwOTksImV4cCI6MjEwNDYzOTA5OX0.xpv0nWp8ilOqO-KkPm89K7vFvpPgYVoS2bXOVe4sHIs";
