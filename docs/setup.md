# Environment Setup

> Complete guide to getting your local development environment ready.

---

## Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [Git](https://git-scm.com/)
- A [Supabase](https://supabase.com) account (free tier is sufficient)

---

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **New project**
3. Choose your organisation, give the project a name, set a database
   password (save it somewhere safe), and pick the region closest to you
4. Wait for the project to finish provisioning (~1 minute)

---

## 2. Apply the Database Schema

The `public.users` table, `app_role` enum, RLS policies, and auth
triggers all need to be created before the app can run.

Use the root-level schema and seed files for the baseline setup, then
apply versioned migrations for structural changes that came later.

### Baseline schema — `supabase/schema.sql`

The base schema creates `public.users`, the `app_role` enum, RLS
policies, and the auth triggers the app depends on.

**Option A — Supabase Dashboard SQL Editor (easiest)**

1. In your project dashboard go to **SQL Editor**
2. Click **New query**
3. Paste the contents of `supabase/schema.sql`
4. Click **Run**

**Option B — Supabase CLI**

```bash
supabase login
supabase link --project-ref <your-project-ref>
supabase db push
```

### Migration 02 — OAuth user trigger

This migration upgrades the `handle_new_user` trigger to support Google
OAuth users and adds the `avatar_url` column to `public.users`. It must
be applied **after** `supabase/schema.sql`.

> **Required before enabling Google OAuth.** If you skip this step,
> Google sign-ups will fail at the database level because the trigger
> cannot find a `username` field in Google's OAuth metadata.

**Option A — Supabase Dashboard SQL Editor**

1. Go to **SQL Editor → New query**
2. Paste the contents of `supabase/migrations/02_oauth_user_trigger.sql`
3. Click **Run**

**Option B — Supabase CLI**

```bash
supabase db push
```

The migration is idempotent — running it more than once is safe.

---

## 3. Get Your API Keys

1. In your Supabase project go to **Settings → API**
2. Copy the following values — you will need them for your `.env` files:

| Key                   | Where to find it                                    | Used in                                          |
| --------------------- | --------------------------------------------------- | ------------------------------------------------ |
| **Project URL**       | Settings → API → Project URL                        | `client/.env` + `server/.env`                    |
| **Anon / public key** | Settings → API → Project API keys → `anon` `public` | `client/.env`                                    |
| **Service role key**  | Settings → API → Project API keys → `service_role`  | `server/.env` only — never expose to the browser |

> The service role key bypasses Row Level Security. Keep it in
> `server/.env` only and never commit it or send it to the client.

---

## 4. Configure `.env` Files

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

**`server/.env`:**

```env
NODE_ENV=development
SERVER_PORT=3000

SUPABASE_URL=https://<your-project-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>

CORS_ALLOWED_ORIGINS=http://localhost:5173
```

**`client/.env`:**

```env
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```

---

## 5. Configure Google OAuth

Google OAuth is configured in Google Cloud and Supabase. The app does
not need any extra OAuth-specific `.env` variables because the existing
Supabase URL and anon key already support the client-side OAuth flow.

If you want to test the in-app OAuth redirect lifecycle
(`OAuthCallback` and `CompleteProfile`), finish this section before
working through the auth flow described in [docs/architecture.md](./architecture.md).

### 5.1 Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/) and
   create a new project, or select an existing one you want to use for
   this app
2. Open **APIs & Services -> Enabled APIs & services**
3. Click **+ ENABLE APIS AND SERVICES**
4. Search for and enable **People API**
5. Go to **APIs & Services -> OAuth consent screen**
6. Configure the consent screen for your project and add the test users
   you want to use during development if Google requires it
7. Go to **APIs & Services -> Credentials**
8. Click **+ CREATE CREDENTIALS -> OAuth client ID**
9. Choose **Web application** as the application type
10. Add this Authorized redirect URI exactly:

```text
https://<your-project-ref>.supabase.co/auth/v1/callback
```

11. Save the credential and copy the **Client ID** and
    **Client Secret**

### 5.2 Supabase Dashboard

1. In your Supabase project, open **Authentication -> Providers**
2. Select **Google**
3. Toggle **Enable sign in with Google**
4. Paste the Google **Client ID** and **Client Secret**
5. Set the **Site URL** to your frontend origin for development:

```text
http://localhost:5173
```

6. Add your deployed frontend URL to the allowed redirect/site URL
   configuration before testing in production
7. Save the provider settings

### 5.3 Notes

- No new `.env` variables are required for Google OAuth in this
  template
- Apply `supabase/migrations/02_oauth_user_trigger.sql` before testing
  Google sign-up so the database trigger can create valid user rows for
  OAuth users
- Apply `supabase/migrations/03_user_provider.sql` before testing the
  username completion flow so new Google users can be routed through
  `/auth/complete-profile`
- The client already uses `detectSessionInUrl: true`, so Supabase will
  exchange the OAuth code automatically when the user returns to
  `/auth/callback`

---

## 6. Seed the Database (Optional)

To create the four default test accounts (Bryan, Odin, Damon, Boss),
run the seed SQL after your schema is applied:

**Option A — Supabase Dashboard SQL Editor**

1. Go to **SQL Editor → New query**
2. Paste the contents of `supabase/seed.sql`
3. Click **Run**

**Option B — Keep using the Node seed helper**

```bash
cd server
node src/db/seed.js
```

Both approaches create the same four development users and keep the
password as `testpass123` for each account:

| Username | Role |
| -------- | ---- |
| `Bryan`  | `USER` |
| `Odin`   | `ADMIN` |
| `Damon`  | `USER` |
| `Boss`   | `SUPER_ADMIN` |

See [Issue #17](https://github.com/[REPO_AUTHOR]/[REPO_NAME]/issues/17)
for the full seed implementation.

---

## 7. Install Dependencies

```bash
# From the project root
npm run install:all
```

---

## 8. Start the App

```bash
# From the project root
npm run dev
```

Or in VS Code: **Terminal → Run Task → 🚀 Dev: Start All**

---

## Troubleshooting

| Problem                                                        | Fix                                                                                                                |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `Missing Supabase environment variables` error on server start | Check that `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set in `server/.env`                                 |
| `Missing Supabase environment variables` error in browser      | Check that `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set in `client/.env`                               |
| Login returns "Invalid login credentials"                      | The user may not exist yet — run `supabase/seed.sql`, use the Node seed helper, or sign up manually               |
| User row missing after signup                                  | Check that `supabase/schema.sql` was applied and the auth triggers exist before running later migrations           |
| Google signup creates a user but `username` is null            | Migration 02 was not applied — run `supabase/migrations/02_oauth_user_trigger.sql` in the SQL Editor               |
| Google signup fails with a DB constraint error                 | Migration 02 was not applied — see above                                                                           |
| `avatar_url` is missing for a Google user                      | The column was added in Migration 02 — re-run it; existing rows will be back-filled automatically                  |
| `redirect_uri_mismatch` from Google                            | Ensure the Google OAuth client has `https://<your-project-ref>.supabase.co/auth/v1/callback` as an authorized redirect URI |
| `Unsupported provider: provider is not enabled`                | Open **Supabase Dashboard -> Authentication -> Providers -> Google** and confirm Google is enabled with valid credentials |
| CORS error in browser                                          | Ensure `CORS_ALLOWED_ORIGINS` in `server/.env` matches your Vite dev server URL (default: `http://localhost:5173`) |
