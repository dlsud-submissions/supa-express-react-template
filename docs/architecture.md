# Architecture

A high-level overview of how the client and server are structured and how they communicate.

---

## Stack

| Layer    | Technology                                                        |
| -------- | ----------------------------------------------------------------- |
| Frontend | React 19, React Router 7, CSS Modules, Vite                       |
| Backend  | Node.js, Express 4 (health check only)                            |
| Database | PostgreSQL via Supabase (managed)                                 |
| Auth     | Supabase Auth (email/password), session persisted in localStorage |
| Testing  | Vitest, React Testing Library, Supertest                          |

---

## Request Flow

Most data flows directly from the React client to Supabase. The Express
server exists only to provide a `/api/health` endpoint and a mounting
point for future server-side concerns.

```
Browser
  │
  ├── React Router  →  Page Component
  │                        │
  │                    API module (supabase.from / supabase.auth)
  │                        │
  └── ──────────────── Supabase SDK ──────────────────►  Supabase Cloud
                                                              │
                                                         RLS policies
                                                         (enforced by Postgres)
                                                              │
                                                         public.users table
                                                         auth.users table
```

Health check (server only):

```
Browser ──── GET /api/health ────► Express ──── { status: 'ok' }
```

---

## Client Structure

```
client/src/
├── components/          # Reusable UI components, grouped by domain
│   ├── feedback/        # Spinner, Toast, ConfirmationModal
│   ├── forms/           # LoginForm, SignupForm
│   ├── navigation/      # Navbar
│   ├── search/          # SearchBar, SearchSidebar, SearchControls, …
│   └── tables/          # TableContainer, UserRow, UserRowActions
├── config/
│   └── searchConfig.js  # Single source of truth for all search sections
├── layouts/
│   └── MainLayout/      # Persistent Navbar + Outlet wrapper
├── lib/
│   └── supabase.js      # Supabase client singleton (anon key)
├── modules/
│   └── api/             # Supabase query wrappers grouped by domain
│       ├── auth/        # authApi — supabase.auth.* wrappers
│       ├── user/        # userApi — public.users SELECT
│       ├── admin/       # adminApi — public.users SELECT + UPDATE
│       └── search/      # searchApi — filtered public.users SELECT
├── pages/               # Route-level components
├── providers/           # AuthProvider, ThemeProvider, ToastProvider
├── routes/              # AuthRoute, AdminRoute guards
├── routes.jsx           # createBrowserRouter config
└── styles/              # Global CSS variables, reset, animations
```

### Key Patterns

**Supabase client singleton** — `client/src/lib/supabase.js` exports a
single `createClient` instance initialised with the anon key. All api
modules and AuthProvider import from this file. This prevents duplicate
GoTrue sessions.

**URL-state for search** — All search state (section, q, sort, filters)
lives in the URL via `useSearchParams`. This makes searches bookmarkable
and shareable, and means no extra state management library is needed.

**API modules** — `modules/api/` contains one file per backend domain
(`auth.api.js`, `admin.api.js`, etc.). Components never import `supabase`
directly — they go through these modules. This keeps components testable
(mock the module, not the SDK).

**Config-driven search** — `searchConfig.js` drives every search UI
component. Adding a new searchable section (e.g. posts) requires only a
new entry in this file plus a row renderer in `SearchPage`.

**{ data, error } return shape** — All api modules return Supabase's
native `{ data, error }` tuple. Callers (pages, components) check
`error` before using `data`, keeping error handling consistent and
explicit throughout the app.

---

## Server Structure

```
server/src/
├── config/              # CORS options
├── lib/
│   └── supabaseAdmin.js # Supabase admin client (service role key)
├── middleware/
│   ├── app/             # Global middleware stack (CORS, body parser)
│   └── error/           # Global error handler
├── routes/
│   └── index.routes.js  # /api/health only
└── app.js               # Express app setup and server start
```

The server no longer handles authentication, user management, or search.
All CRUD is done client-side via the Supabase SDK with RLS enforcing
access control at the database level.

The `supabaseAdmin` client (service role key) is available in
`server/src/lib/supabaseAdmin.js` for any future server-side operations
that need to bypass RLS (e.g. the seed script).

---

## Auth Flow

```
1. Signup — POST via Supabase Auth SDK
   → supabase.auth.signUp({ email: username@app.local, password, data: { username } })
   → Supabase creates auth.users row
   → handle_new_user DB trigger fires → inserts public.users row

2. Login — POST via Supabase Auth SDK
   → supabase.auth.signInWithPassword({ email: username@app.local, password })
   → Supabase returns session (JWT + refresh token)
   → Session persisted in localStorage

3. Session rehydration on page load
   → AuthProvider calls supabase.auth.getSession() on mount
   → If session exists: fetches public.users row for username + role
   → AuthProvider subscribes to onAuthStateChange for real-time sync

4. Subsequent requests
   → supabase.from('users').select(...)
   → SDK automatically attaches the session JWT as Authorization header
   → RLS policies on public.users enforce read/write access

5. Logout
   → supabase.auth.signOut()
   → onAuthStateChange fires SIGNED_OUT → AuthProvider clears user state
   → Session removed from localStorage
```

---

## Role Hierarchy

```
SUPER_ADMIN  →  can promote/demote ADMIN ↔ USER (RLS UPDATE policy)
ADMIN        →  can read all public.users rows (RLS SELECT policy)
USER         →  can read only their own public.users row (RLS SELECT policy)
```

Route guards are applied at two levels:

- **Database**: RLS policies on `public.users` enforce access at the data layer
- **Client**: `<AuthRoute>` and `<AdminRoute>` components in the router config protect routes in the UI

---

## Database Schema

```sql
-- Role enum
CREATE TYPE app_role AS ENUM ('USER', 'ADMIN', 'SUPER_ADMIN');

-- Profile table (mirrors auth.users via trigger)
CREATE TABLE public.users (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username    VARCHAR(20) UNIQUE NOT NULL,
  role        app_role NOT NULL DEFAULT 'USER',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  last_login  TIMESTAMPTZ
);

-- Triggers
-- handle_new_user()   → runs AFTER INSERT on auth.users
-- handle_user_login() → runs AFTER UPDATE of last_sign_in_at on auth.users
```

Full migration SQL: `supabase/migrations/01_users_table.sql`
