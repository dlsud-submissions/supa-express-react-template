# Project Name

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![The Odin Project](https://img.shields.io/badge/The%20Odin%20Project-NodeJS-red)](https://www.theodinproject.com/paths/full-stack-javascript/courses/nodejs)

> A full-stack application built with React and Express as part of The Odin Project's NodeJS curriculum. Features Supabase Auth, role-based access control enforced by Row Level Security, a Supabase-backed CRUD layer, and a modular search system.

## 📋 Table of Contents

- [Project Name](#project-name)
  - [📋 Table of Contents](#-table-of-contents)
  - [✨ Features](#-features)
  - [🚀 Getting Started](#-getting-started)
  - [📁 Project Structure](#-project-structure)
  - [📖 Documentation](#-documentation)
  - [🧪 Testing](#-testing)
  - [💡 Future Improvements](#-future-improvements)
  - [🛠️ Technologies Used](#️-technologies-used)
  - [🙏 Acknowledgments](#-acknowledgments)

## ✨ Features

- Supabase Auth (email/password) with session persistence in localStorage
- Role-based access control (USER / ADMIN / SUPER_ADMIN) enforced by Postgres RLS
- Full-stack search with filters, sorting, and URL-state persistence
- Direct Supabase CRUD from the client — no Express controllers for data
- Vitest + React Testing Library test suite (client & server)
- Dark/light theme toggle
- Responsive layout with mobile Navbar

## 🚀 Getting Started

See **[docs/setup.md](docs/setup.md)** for the full environment setup guide.

**Quick start** (after setup):

```bash
npm run install:all   # install all dependencies
npm run dev           # start client + server concurrently
```

## 📁 Project Structure

```
template-react-expressjs/
├── client/               # React + Vite frontend
│   └── src/
│       ├── components/   # UI components grouped by domain
│       ├── config/       # searchConfig.js — drives all search UI
│       ├── layouts/      # MainLayout (Navbar + Outlet)
│       ├── lib/          # supabase.js — Supabase client singleton
│       ├── modules/api/  # Supabase query wrappers per domain
│       ├── pages/        # Route-level components
│       ├── providers/    # Auth, Theme, Toast context
│       ├── routes/       # AuthRoute, AdminRoute guards
│       ├── routes.jsx    # createBrowserRouter config
│       └── styles/       # Global CSS variables, reset, animations
├── server/               # Express backend (health check only)
│   └── src/
│       ├── config/       # CORS options
│       ├── lib/          # supabaseAdmin.js — service role client
│       ├── middleware/   # CORS, body parser, error handler
│       └── routes/       # /api/health
├── supabase/
│   └── migrations/       # SQL migration files
│       └── 01_users_table.sql
├── docs/
│   ├── setup.md          # Supabase project setup, .env config, seeding
│   ├── architecture.md   # Stack overview, request flow, auth flow, schema
│   └── testing.md        # Testing conventions, Supabase mock patterns
├── CONTRIBUTING.md       # Branching, commit conventions, PR process
├── CHANGELOG.md          # Version history
└── package.json          # Root orchestration scripts
```

## 📖 Documentation

| Doc                                          | Description                                                                 |
| -------------------------------------------- | --------------------------------------------------------------------------- |
| [docs/setup.md](docs/setup.md)               | Supabase project setup, API key config, `.env` files, seeding test accounts |
| [docs/architecture.md](docs/architecture.md) | Stack overview, request flow, client/server structure, auth flow, DB schema |
| [docs/testing.md](docs/testing.md)           | Testing patterns, Supabase mock conventions, what to test                   |
| [CONTRIBUTING.md](CONTRIBUTING.md)           | Branching strategy, commit conventions, PR process                          |
| [CHANGELOG.md](CHANGELOG.md)                 | Version history                                                             |

## 🧪 Testing

```bash
cd client && npm run test:watch   # client — watch mode
cd server && npm run test:watch   # server — watch mode
```

See [docs/testing.md](docs/testing.md) for Supabase mock patterns, auth
state simulation, and API module testing conventions.

## 💡 Future Improvements

- [ ] Gallery and list view modes for search results
- [ ] Pagination on search results
- [ ] Email verification on signup
- [ ] File upload support (profile avatars)
- [ ] OAuth providers (Google, GitHub) via Supabase Auth
- [ ] Rate limiting on the Express health endpoint

## 🛠️ Technologies Used

**Client:** React 19, React Router 7, Vite, CSS Modules, Lucide React, Supabase JS, Vitest, React Testing Library

**Server:** Node.js, Express (health check only)

**Database & Auth:** Supabase (PostgreSQL + Auth + RLS), Zod (client-side validation)

**Tooling:** ESLint, Prettier, concurrently, nodemon

## 🙏 Acknowledgments

- **The Odin Project** — For providing an amazing free curriculum
- **The TOP Community** — For being supportive and helpful throughout

---

<div align="center">

Built with 💡 and ☕ as part of my journey through <a href="https://www.theodinproject.com/paths/full-stack-javascript/courses/nodejs">The Odin Project — NodeJS</a>

</div>
