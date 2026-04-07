# Environment Setup

> Complete guide to getting your local development environment ready.

---

## Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [Git](https://git-scm.com/)
- A [Supabase](https://supabase.com/) account (free tier is sufficient)

---

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com/) and sign in
2. Click **New project**
3. Fill in:
   - **Name** — anything you like (e.g. `template-dev`)
   - **Database password** — generate a strong one and save it somewhere safe
   - **Region** — pick the closest to you
4. Click **Create new project** and wait ~1 minute for provisioning

---

## 2. Get Your API Keys

1. In your project dashboard go to **Settings → API**
2. Copy the following — you'll need them for your `.env` files:

| Key                   | Where to find it                  | Used in                       |
| --------------------- | --------------------------------- | ----------------------------- |
| **Project URL**       | "Project URL" field               | `client/.env` + `server/.env` |
| **anon / public key** | "Project API keys → anon public"  | `client/.env` only            |
| **service_role key**  | "Project API keys → service_role" | `server/.env` only            |

> **Never** put the `service_role` key in the client. It bypasses all RLS policies.

---

## 3. Run the Database Migration

1. In your Supabase dashboard go to **SQL Editor**
2. Click **New query**
3. Copy the contents of `supabase/migrations/01_users_table.sql` from this repo
4. Click **Run**

This creates the `public.users` table, the `app_role` enum, all RLS policies,
and the triggers that auto-create profile rows on signup.

---

## 4. Configure `.env` Files

```bash
cp client/.env.example client/.env
cp server/.env.example server/.env
```

**`client/.env`:**

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**`server/.env`:**

```env
NODE_ENV=development
SERVER_PORT=3000
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

---

## 5. Install Dependencies

```bash
# From the project root
npm run install:all
```

---

## 6. Seed Initial Data

```bash
cd server
npm run db:seed
```

This creates four accounts (password: `testpass123`):

| Username | Role        |
| -------- | ----------- |
| Bryan    | USER        |
| Odin     | ADMIN       |
| Damon    | USER        |
| Boss     | SUPER_ADMIN |

---

## 7. Start the App

```bash
# From the project root
npm run dev
```

Or in VS Code: **Terminal → Run Task → 🚀 Dev: Start All**

---

## Troubleshooting

| Problem                                                   | Fix                                                                                                                 |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `Missing VITE_SUPABASE_URL` error on client start         | Check `client/.env` exists and has the correct Project URL                                                          |
| `Missing SUPABASE_SERVICE_ROLE_KEY` error on server start | Check `server/.env` exists and has the service role key                                                             |
| RLS error / empty results when querying users             | Verify the migration in Step 3 ran without errors in the SQL Editor                                                 |
| Seed script fails with "User already exists"              | Go to Supabase Dashboard → Authentication → Users and delete existing users, then re-run                            |
| CORS error in browser                                     | Ensure `CORS_ALLOWED_ORIGINS` in `server/.env` matches your Vite dev URL exactly (default: `http://localhost:5173`) |
