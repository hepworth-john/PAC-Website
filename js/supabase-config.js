// Configuration for the contact form's Supabase Edge Function.
//
// After you create your Supabase project and deploy the
// "contact-form" function (see supabase/README.md for the full
// walkthrough), fill in the two values below:
//
//   SUPABASE_FUNCTION_URL -- Project Settings > API > Project URL,
//     with "/functions/v1/contact-form" appended. It looks like:
//     https://abcdefghijklmnop.supabase.co/functions/v1/contact-form
//
//   SUPABASE_ANON_KEY -- Project Settings > API > "anon" "public"
//     key. This key is meant to be public/embedded in client-side
//     code -- it has no access to the contact_submissions table
//     (Row Level Security blocks it). It's only used here to prove
//     to Supabase that the request is coming from a real client.
const SUPABASE_FUNCTION_URL = "https://iqikfwhjohuoentncwxi.supabase.co/functions/v1/contact-form";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxaWtmd2hqb2h1b2VudG5jd3hpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkwNjMwOTksImV4cCI6MjEwNDYzOTA5OX0.xpv0nWp8ilOqO-KkPm89K7vFvpPgYVoS2bXOVe4sHIs";
