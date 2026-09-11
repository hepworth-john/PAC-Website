-- Table that stores submissions from the public contact form.
create table if not exists public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  first_name text not null,
  last_name text not null,
  email text not null,
  reason text not null,
  message text not null,
  mailing_list_opt_in boolean not null default false
);

-- Row Level Security is enabled with NO policies defined below.
-- That means the anon/authenticated roles (i.e. anyone calling
-- Supabase from the browser) have zero access to this table --
-- no select, insert, update, or delete.
--
-- The contact-form Edge Function inserts rows using the SERVICE
-- ROLE key, which bypasses RLS entirely. That's what makes this
-- setup safe: the table is completely unreachable from client-side
-- code, and the only way in is through the validated Edge Function.
alter table public.contact_submissions enable row level security;
