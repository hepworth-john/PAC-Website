-- Table that stores RSVPs from the events page.
create table if not exists public.event_rsvps (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  event_id text not null,
  event_name text not null,
  first_name text not null,
  last_name text not null,
  email text not null,
  guest_count integer not null default 1,
  notes text,
  -- Resubmitting the same email for the same event updates that
  -- person's RSVP (guest count, notes) instead of creating a
  -- duplicate row. The event-rsvp Edge Function upserts on this.
  constraint event_rsvps_event_email_unique unique (event_id, email)
);

-- Same lockdown pattern as contact_submissions: RLS is enabled with
-- no policies, so the anon/authenticated roles have zero direct
-- access. Only the event-rsvp Edge Function (using the service role
-- key, which bypasses RLS) can read or write this table.
alter table public.event_rsvps enable row level security;
