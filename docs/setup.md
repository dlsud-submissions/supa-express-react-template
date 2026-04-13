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

The migration SQL is saved in the repo at
`supabase/migrations/01_users_table.sql`.

**Option A — Supabase Dashboard SQL Editor (easiest)**

1. In your project dashboard go to **SQL Editor**
2. Click **New query**
3. Paste the contents of `supabase/migrations/01_users_table.sql`
4. Click **Run**

**Option B — Supabase CLI**

```bash
supabase login
supabase link --project-ref <your-project-ref>
supabase db push
```

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

## 5. Seed the Database (Optional)

To create the four default test accounts (Bryan, Odin, Damon, Boss),
run the seed script after your schema is applied:

```bash
cd server
node src/db/seed.js
```

This uses the Supabase Admin API to create auth users and public.users
rows via the existing DB trigger. All accounts use the password
`testpass123`.

See [Issue #17](https://github.com/[REPO_AUTHOR]/[REPO_NAME]/issues/17)
for the full seed implementation.

---

## 6. Install Dependencies

```bash
# From the project root
npm run install:all
```

---

## 7. Start the App

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
| Login returns "Invalid login credentials"                      | The user may not exist yet — run the seed script or sign up manually                                               |
| User row missing after signup                                  | Check that the `handle_new_user` trigger is applied — re-run the migration SQL if needed                           |
| CORS error in browser                                          | Ensure `CORS_ALLOWED_ORIGINS` in `server/.env` matches your Vite dev server URL (default: `http://localhost:5173`) |
