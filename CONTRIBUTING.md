# Contributing

Thank you for taking the time to contribute! This document covers how to set up the project for development, the branching and commit conventions used, and the process for submitting changes.

---

## Getting Started

1. **Fork** the repository and clone your fork
2. Follow [docs/setup.md](docs/setup.md) to set up PostgreSQL and your `.env` files
3. Install dependencies:

```bash
npm run install:all
```

4. Start the dev servers:

```bash
npm run dev
```

---

## Branching Strategy

| Branch        | Purpose                                        |
| ------------- | ---------------------------------------------- |
| `main`        | Stable, production-ready code                  |
| `dev`         | Integration branch — merge features here first |
| `feature/<n>` | New features (`feature/search-filters`)        |
| `fix/<n>`     | Bug fixes (`fix/date-filter-query`)            |
| `chore/<n>`   | Non-functional changes (`chore/update-deps`)   |
| `docs/<n>`    | Documentation only (`docs/setup-guide`)        |

Always branch off `dev`, not `main`.

---

## Commit Convention

This project follows [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short description>
```

**Types:**

| Type       | When to use                                      |
| ---------- | ------------------------------------------------ |
| `feat`     | A new feature                                    |
| `fix`      | A bug fix                                        |
| `docs`     | Documentation changes only                       |
| `style`    | Formatting, missing semicolons — no logic change |
| `refactor` | Code restructuring without feature or fix        |
| `test`     | Adding or fixing tests                           |
| `chore`    | Dependency updates, config changes               |

**Examples:**

```
feat(search): add date range filter to user search
fix(auth): prevent token refresh loop on 401
docs(setup): add Windows pgAdmin startup steps
test(search-queries): add joinedAfter date filter tests
chore(deps): update prisma to 7.4.0
```

---

## Running Tests

```bash
# Client
cd client && npm test

# Server
cd server && npm test
```

All tests must pass before opening a pull request. New features should include tests.

---

## Pull Request Process

1. Make sure your branch is up to date with `dev`
2. Run the full test suite — fix any failures
3. Open a PR against `dev` (not `main`)
4. Fill in the PR description: what changed and why
5. Link any related issues

---

## Code Style

- **Prettier** handles formatting automatically on save
- **ESLint** enforces code quality rules
- Run both manually if needed:

```bash
cd client && npm run format && npm run lint:fix
```
