# Architecture

A high-level overview of how the client and server are structured and
how they communicate.

---

## Stack

| Layer    | Technology                                                               |
| -------- | ------------------------------------------------------------------------ |
| Frontend | React 19, React Router 7, CSS Modules, Vite                              |
| Backend  | Node.js, Express 4 (health check only)                                   |
| Database | PostgreSQL via Supabase (managed)                                        |
| Auth     | Supabase Auth (email/password + Google OAuth), session persisted locally |
| Testing  | Vitest, React Testing Library, Supertest                                 |

---

## Request Flow

Most data flows directly from the React client to Supabase. The Express
server exists only to provide a `/api/health` endpoint and a mounting
point for future server-side concerns.

```text
Browser
  |
  +-- React Router -> Page Component
  |                     |
  |                 API module (supabase.from / supabase.auth)
  |                     |
  +---------------------+-------------------------------> Supabase Cloud
                                                    |
                                               RLS policies
                                               (Postgres)
                                                    |
                                               public.users
                                               auth.users
```

Health check (server only):

```text
Browser ---- GET /api/health ----> Express ---- { status: 'ok' }
```

---

## Client Structure

```text
client/src/
|-- components/          # Reusable UI components, grouped by domain
|   |-- buttons/         # ReturnHomeButton, GoogleAuthButton
|   |-- feedback/        # Spinner, Toast, ConfirmationModal
|   |-- forms/           # LoginForm, SignupForm
|   |-- navigation/      # Navbar
|   |-- search/          # SearchBar, SearchSidebar, SearchControls, ...
|   `-- tables/          # TableContainer, UserRow, UserRowActions
|-- config/
|   `-- searchConfig.js  # Single source of truth for search sections
|-- layouts/
|   `-- MainLayout/      # Persistent Navbar + Outlet wrapper
|-- lib/
|   `-- supabase.js      # Supabase client singleton (anon key)
|-- modules/
|   `-- api/
|       |-- auth/        # authApi - supabase.auth.* wrappers
|       |-- user/        # userApi - public.users reads + username completion update
|       |-- admin/       # adminApi - public.users SELECT + UPDATE
|       `-- search/      # searchApi - filtered public.users SELECT
|-- pages/
|   `-- auth/            # OAuthCallback, CompleteProfile
|-- providers/           # AuthProvider, ThemeProvider, ToastProvider
|-- routes/              # AuthRoute, AdminRoute guards
|-- routes.jsx           # createBrowserRouter config
`-- styles/              # Global CSS variables, reset, animations
```

### Key Patterns

**Supabase client singleton** - `client/src/lib/supabase.js` exports a
single `createClient` instance initialized with the anon key. All API
modules and `AuthProvider` import from this file. This prevents
duplicate GoTrue sessions.

**Provider-owned auth entry points** - `AuthProvider` owns password
login, Google OAuth startup through `loginWithGoogle()`, logout, and
session/profile rehydration. Form components consume `useAuth()` rather
than calling `supabase.auth.*` directly for shared auth flows.

**URL-state for search** - All search state (section, q, sort, filters)
lives in the URL via `useSearchParams`. This makes searches bookmarkable
and shareable, and means no extra state management library is needed.

**API modules** - `modules/api/` contains one file per backend domain
(`auth.api.js`, `admin.api.js`, etc.). Components never import
`supabase` directly when an API wrapper already exists. This keeps
components testable because tests can mock the module instead of the
SDK.

**Config-driven search** - `searchConfig.js` drives every search UI
component. Adding a new searchable section requires a new config entry
plus a row renderer in `SearchPage`.

**{ data, error } return shape** - All API modules return Supabase's
native `{ data, error }` tuple. Callers check `error` before using
`data`, which keeps error handling consistent and explicit.

---

## Server Structure

```text
server/src/
|-- config/              # CORS options
|-- lib/
|   `-- supabaseAdmin.js # Supabase admin client (service role key)
|-- middleware/
|   |-- app/             # Global middleware stack (CORS, body parser)
|   `-- error/           # Global error handler
|-- routes/
|   `-- index.routes.js  # /api/health only
`-- app.js               # Express app setup and server start
```

The server no longer handles authentication, user management, or
search. All CRUD is done client-side via the Supabase SDK with RLS
enforcing access control at the database level.

The `supabaseAdmin` client in `server/src/lib/supabaseAdmin.js` remains
available for future server-side operations that need to bypass RLS,
such as seeding or admin-only batch work.

---

## Auth Flow

```text
1. Signup
   -> supabase.auth.signUp({ email: username@app.local, password, data: { username } })
   -> Supabase creates auth.users row
   -> handle_new_user trigger inserts public.users row

2. Login
   -> supabase.auth.signInWithPassword({ email: username@app.local, password })
   -> Supabase returns a session
   -> Session is persisted locally

3. Session rehydration on page load
   -> AuthProvider calls supabase.auth.getSession() on mount
   -> If session exists: fetch public.users row for username + role
   -> AuthProvider subscribes to onAuthStateChange for real-time sync

4. Subsequent requests
   -> supabase.from('users').select(...)
   -> SDK attaches the session JWT automatically
   -> RLS policies on public.users enforce access

5. Logout
   -> supabase.auth.signOut()
   -> onAuthStateChange fires SIGNED_OUT
   -> AuthProvider clears user state
```

### Google OAuth Flow

For provider setup, see the
[Google OAuth section in setup.md](./setup.md#5-configure-google-oauth).

```text
1. User clicks "Continue with Google"
   -> LoginForm / SignupForm calls useAuth().loginWithGoogle()
   -> AuthProvider calls supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: <origin>/auth/callback }
      })

2. Google and Supabase complete the OAuth handshake
   -> Browser leaves the app for Google's consent screen
   -> Google returns to Supabase /auth/v1/callback
   -> Supabase redirects back to /auth/callback?code=...

3. OAuthCallback mounts
   -> detectSessionInUrl: true exchanges the code automatically
   -> AuthProvider receives SIGNED_IN and fetches public.users

4. Routing decision
   -> If provider === 'google' and username_confirmed === false
      redirect to /auth/complete-profile
   -> Otherwise redirect to /dashboard or /admin-dashboard

5. Username completion
   -> CompleteProfile validates the username
   -> userApi.updateUsername() saves username + username_confirmed=true
   -> App redirects to the appropriate dashboard
```

---

## Role Hierarchy

```text
SUPER_ADMIN -> can promote/demote ADMIN <-> USER
ADMIN       -> can read all public.users rows
USER        -> can read only their own public.users row
```

Route guards are applied at two levels:

- Database: RLS policies on `public.users` enforce access at the data layer
- Client: `AuthRoute` and `AdminRoute` protect routes in the router config

---

## Database Schema

```sql
CREATE TYPE app_role AS ENUM ('USER', 'ADMIN', 'SUPER_ADMIN');

CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(20) UNIQUE NOT NULL,
  role app_role NOT NULL DEFAULT 'USER',
  avatar_url TEXT,
  provider TEXT NOT NULL DEFAULT 'email',
  username_confirmed BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ
);

-- Trigger functions
-- handle_new_user()   -> AFTER INSERT on auth.users
-- handle_user_login() -> AFTER UPDATE OF last_sign_in_at on auth.users
```

Relevant SQL files:

- `supabase/schema.sql` - baseline schema for fresh projects
- `supabase/migrations/02_oauth_user_trigger.sql` - OAuth-aware username
  derivation + `avatar_url`
- `supabase/migrations/03_user_provider.sql` - `provider`,
  `username_confirmed`, and first-login username completion flow
