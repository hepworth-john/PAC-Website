# Contact form -> Supabase setup

The contact form on `contact.html` submits to a Supabase Edge Function
(`supabase/functions/contact-form`), which validates the submission and
inserts it into a `contact_submissions` table. The table itself is locked
down with Row Level Security and has no public policies, so it can only be
written to through the Edge Function (which uses the service role key,
issued only to your Supabase project, never exposed to visitors).

Follow these steps once to get it live.

## 1. Create a Supabase project

1. Go to https://supabase.com, sign up / log in, and click "New project".
2. Pick an organization, name it (e.g. `pac-website`), set a database
   password (save it somewhere safe), and choose a region close to your
   users (e.g. US West).
3. Wait a minute or two for the project to finish provisioning.

## 2. Create the database table

1. In your new project, open the **SQL Editor** (left sidebar).
2. Paste in the contents of
   `supabase/migrations/20260910210002_create_contact_submissions.sql`
   from this repo and click **Run**.

   (If you'd rather use the Supabase CLI instead of pasting SQL by hand,
   see the CLI section below -- `supabase db push` runs migrations for you.)

## 3. Install the Supabase CLI

Pick whichever matches your machine:

```bash
# macOS (Homebrew)
brew install supabase/tap/supabase

# npm (any OS with Node installed)
npm install -g supabase
```

## 4. Log in and link this repo to your project

From the root of this repo:

```bash
supabase login
supabase init          # only if supabase/config.toml doesn't already exist
supabase link --project-ref YOUR_PROJECT_REF
```

`YOUR_PROJECT_REF` is in your project's URL:
`https://supabase.com/dashboard/project/YOUR_PROJECT_REF`

If you skipped step 2, you can now run `supabase db push` instead to apply
the migration from the CLI.

## 5. Deploy the Edge Function

```bash
supabase functions deploy contact-form
```

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are provided to every Edge
Function automatically -- you don't need to set any secrets by hand.

## 6. Fill in your project's public config

Open **Project Settings > API** in the Supabase dashboard and copy:

- **Project URL**
- **anon / public** key (NOT the `service_role` key -- that one must stay
  secret and never appear in this repo or in the browser)

Then edit `js/supabase-config.js` in this repo:

```js
const SUPABASE_FUNCTION_URL = "https://YOUR_PROJECT_REF.supabase.co/functions/v1/contact-form";
const SUPABASE_ANON_KEY = "YOUR_ANON_KEY";
```

The anon key is safe to publish in client-side code -- it's how Supabase
is designed to be used from a browser. It can't read, write, or delete
anything in `contact_submissions` on its own; Row Level Security blocks
it, and only the Edge Function (using the separate, secret service role
key) can write to that table.

## 7. Commit, push, and test

Commit the changes (including your filled-in `js/supabase-config.js`) and
push to GitHub Pages as usual. Then submit a test message through the live
contact form and check **Table Editor > contact_submissions** in Supabase
to confirm it landed.

## Viewing submissions

For now, check submissions in the Supabase dashboard: **Table Editor >
contact_submissions**. You can sort/filter there, or export to CSV. If you
later want email notifications or an admin page, that can be added as a
follow-up (it needs an email-sending service like Resend, since Supabase
doesn't send email on its own).

## Restricting CORS to your domain (optional, recommended later)

The Edge Function currently allows requests from any origin
(`Access-Control-Allow-Origin: *`) so it's easy to test. Once everything
is working, you can tighten this in
`supabase/functions/contact-form/index.ts` by changing that header to
`https://icfpac.org`, then redeploy with `supabase functions deploy
contact-form`.
