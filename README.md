# Project Name

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![The Odin Project](https://img.shields.io/badge/The%20Odin%20Project-NodeJS-red)](https://www.theodinproject.com/paths/full-stack-javascript/courses/nodejs)

> A full-stack application built with React and Express as part of The Odin Project's NodeJS curriculum. Features JWT authentication, role-based access control, PostgreSQL via Prisma ORM, and a modular search system.

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

- JWT authentication with HttpOnly cookies
- Role-based access control (USER / ADMIN / SUPER_ADMIN)
- Full-stack search with filters, sorting, and URL-state persistence
- Prisma ORM with PostgreSQL
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
│       ├── modules/api/  # Fetch wrappers per domain
│       ├── pages/        # Route-level components
│       ├── providers/    # Auth, Theme, Toast context
│       ├── routes/       # AuthRoute, AdminRoute guards
│       ├── routes.jsx    # createBrowserRouter config
│       └── styles/       # Global CSS variables, reset, animations
├── server/               # Express backend
│   └── src/
│       ├── config/       # Passport, CORS, cookie options
│       ├── controllers/  # Route handlers
│       ├── db/queries/   # Prisma query functions per domain
│       ├── middleware/   # Auth, error, app middleware
│       └── routes/       # Express routers
├── docs/
│   ├── setup.md          # Environment setup (PostgreSQL, .env, pgAdmin)
│   ├── architecture.md   # Stack overview, request flow, patterns
│   └── testing.md        # Testing conventions and patterns
├── CONTRIBUTING.md       # Branching, commit conventions, PR process
├── CHANGELOG.md          # Version history
└── package.json          # Root orchestration scripts
```

## 📖 Documentation

| Doc                                          | Description                                                             |
| -------------------------------------------- | ----------------------------------------------------------------------- |
| [docs/setup.md](docs/setup.md)               | PostgreSQL installation (Windows/macOS/Linux), `.env` config, pgAdmin 4 |
| [docs/architecture.md](docs/architecture.md) | Stack overview, request flow, client/server structure, auth flow        |
| [docs/testing.md](docs/testing.md)           | Testing patterns, mocking conventions, what to test                     |
| [CONTRIBUTING.md](CONTRIBUTING.md)           | Branching strategy, commit conventions, PR process                      |
| [CHANGELOG.md](CHANGELOG.md)                 | Version history                                                         |

## 🧪 Testing

```bash
cd client && npm run test:watch   # client — watch mode
cd server && npm run test:watch   # server — watch mode
```

See [docs/testing.md](docs/testing.md) for patterns, mocking conventions, and gotchas.

## 💡 Future Improvements

- [ ] Gallery and list view modes for search results
- [ ] Pagination on search results
- [ ] Email verification on signup
- [ ] File upload support (profile avatars)
- [ ] Rate limiting on auth endpoints

## 🛠️ Technologies Used

**Client:** React 19, React Router 7, Vite, CSS Modules, Lucide React, Vitest, React Testing Library

**Server:** Node.js, Express, Prisma ORM, PostgreSQL, Passport.js (Local + JWT), bcryptjs, express-validator

**Tooling:** ESLint, Prettier, concurrently, nodemon

## 🙏 Acknowledgments

- **The Odin Project** — For providing an amazing free curriculum
- **The TOP Community** — For being supportive and helpful throughout

---

<div align="center">

Built with 💡 and ☕ as part of my journey through <a href="https://www.theodinproject.com/paths/full-stack-javascript/courses/nodejs">The Odin Project — NodeJS</a>

</div>
