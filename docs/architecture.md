# Architecture

A high-level overview of how the client and server are structured and how they communicate.

---

## Stack

| Layer    | Technology                                  |
| -------- | ------------------------------------------- |
| Frontend | React 19, React Router 7, CSS Modules, Vite |
| Backend  | Node.js, Express 4                          |
| Database | PostgreSQL via Prisma ORM                   |
| Auth     | Passport.js (Local + JWT), HttpOnly cookies |
| Testing  | Vitest, React Testing Library, Supertest    |

---

## Request Flow

```
Browser
  │
  ├── React Router  →  Page Component
  │                        │
  │                    API module (fetch wrapper)
  │                        │
  └── ──────────────── HTTP request ──────────────────►  Express
                                                              │
                                                        auth.middleware
                                                        (Passport JWT)
                                                              │
                                                         Controller
                                                              │
                                                        DB Query fn
                                                        (Prisma ORM)
                                                              │
                                                         PostgreSQL
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
├── modules/
│   └── api/             # Fetch wrappers grouped by domain (auth, user, admin, search)
├── pages/               # Route-level components
├── providers/           # AuthProvider, ThemeProvider, ToastProvider
├── routes/              # AuthRoute, AdminRoute guards
├── routes.jsx           # createBrowserRouter config
└── styles/              # Global CSS variables, reset, animations
```

### Key Patterns

**URL-state for search** — All search state (section, q, sort, filters) lives in the URL via `useSearchParams`. This makes searches bookmarkable and shareable, and means no extra state management library is needed.

**API modules** — `modules/api/` contains one file per backend domain (`auth.api.js`, `admin.api.js`, etc.). Components never call `fetch` directly — they import from these modules. This keeps components testable (mock the module, not fetch).

**Config-driven search** — `searchConfig.js` drives every search UI component. Adding a new searchable section (e.g. posts) requires only a new entry in this file plus a row renderer in `SearchPage`.

---

## Server Structure

```
server/src/
├── config/              # Passport strategy setup, cookie options, CORS
├── controllers/         # Route handler functions — one file per domain
├── db/
│   ├── queries/         # Prisma query functions — one folder per domain
│   └── pool.js          # pg connection pool (used by Prisma adapter)
├── errors/              # Custom AppError / ServerError classes
├── middleware/
│   ├── app/             # Global middleware stack (CORS, cookies, body parser)
│   ├── auth/            # isAuthenticated (Passport JWT), isAdmin
│   └── error/           # Global error handler
├── routes/              # Express routers — one file per domain
│   └── index.routes.js  # Mounts all routers under /api/*
└── app.js               # Express app setup and server start
```

### Key Patterns

**Controller → Query separation** — Controllers handle HTTP concerns (req, res, next, status codes). All database access is in `db/queries/`. Controllers never import Prisma directly.

**Whitelist-based sorting** — Query functions validate `sortBy` against an explicit array of allowed field names before passing to Prisma. This prevents SQL injection via sort parameters.

**Layered error handling** — Custom error classes (`ValidationError`, `NotFoundError`, etc.) carry a `statusCode`. The global error middleware in `error/` reads this to send the right HTTP response without scattered `res.status()` calls.

---

## Auth Flow

```
1. POST /api/auth/login
   → Passport Local Strategy validates username + password
   → JWT signed with HS256, embedded in HttpOnly cookie

2. Subsequent requests
   → Passport JWT Strategy extracts token from cookie or Authorization header
   → Decodes payload, fetches user from DB, attaches to req.user

3. GET /api/auth/me
   → Reads req.user directly (no DB call — user already on request)

4. Logout
   → Clears the cookie, client redirects to /log-in
```

---

## Role Hierarchy

```
SUPER_ADMIN  →  can promote/demote ADMIN ↔ USER
ADMIN        →  can access admin dashboard and user management
USER         →  standard authenticated access
```

Route guards are applied at two levels:

- **Server**: `isAuthenticated` and `isAdmin` middleware on routes
- **Client**: `<AuthRoute>` and `<AdminRoute>` components in the router config
