# Testing Guide

Conventions, patterns, and gotchas for writing tests in this project.

---

## Running Tests

```bash
# Client — watch mode
cd client && npm run test:watch

# Client — run once (CI)
cd client && npm run test:run

# Server — watch mode
cd server && npm run test:watch

# Server — run once
cd server && npm test
```

---

## Client Tests (Vitest + React Testing Library)

### Setup

`client/vitest.setup.jsx` runs before every test file and handles:

- `@testing-library/jest-dom` matchers
- Lucide icon mocks (renders `<div data-testid="icon-<Name>" />` instead of SVG)
- `localStorage`, `fetch`, and `window.location` stubs
- A global `react-router` mock that stubs `useNavigate`, `useRouteError`, and `Navigate`

### Custom Render

Always import `render` from the testing utils, not directly from RTL:

```jsx
import { render, screen } from '../../../modules/utils/testing/testing.utils';
```

`customRender` wraps the component in `MemoryRouter + ThemeProvider + ToastProvider + AuthProvider`, so routing hooks and context hooks work without manual setup.

### Auth Mock Pattern

`customRender` wraps the real `AuthProvider`, which fires an async `checkAuthStatus` on mount. This causes `act()` warnings. Always add this mock to any test file that renders a component using `useAuth`:

```jsx
vi.mock(
  '../../../providers/AuthProvider/AuthProvider',
  async (importOriginal) => {
    const actual = await importOriginal();
    return {
      ...actual,
      useAuth: vi.fn(),
      AuthProvider: ({ children }) => children,
    };
  }
);
```

### API Mock Pattern

Mock the API module — never mock raw `fetch` when a component uses a wrapper:

```jsx
vi.mock('../../modules/api/admin/admin.api', () => ({
  adminApi: {
    promoteUser: vi.fn(),
    demoteUser: vi.fn(),
  },
}));
```

### Mocking `useNavigate`

`vitest.setup.jsx` already stubs `useNavigate` globally with `vi.fn(() => vi.fn())`. To assert navigation in a specific test, override it at the module level:

```jsx
const mockNavigate = vi.fn();
vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, useNavigate: () => mockNavigate };
});
```

> Never use `vi.spyOn(require('react-router'), 'useNavigate')` — this breaks with ESM.

### Async Components

Use `waitFor` for assertions that depend on async state:

```jsx
await waitFor(() => {
  expect(screen.getByText('alice')).toBeInTheDocument();
});
```

### "Renders Nothing" Tests

`customRender` always adds a wrapper div — `container.firstChild` is never null. Query for the component's content instead:

```jsx
// ✗ Don't do this
expect(container.firstChild).toBeNull();

// ✓ Do this instead
expect(screen.queryByText(/some content/i)).not.toBeInTheDocument();
```

### Portal Components

Components that use `createPortal` (e.g. `ConfirmationModal`, `UserRowActions` dropdown) render into `document.body`, outside the component tree. RTL's `screen` queries the entire document body by default, so portalled content is found normally with `screen.getByText(...)`.

---

## Server Tests (Vitest + Supertest)

### Setup

`server/vitest.setup.js` provides two globals available in all test files:

```js
// Chainable Express mock
const { req, res, next } = mockExpressContext();

// Prisma user model mock
vi.mock('../lib/prisma.js', () => ({
  prisma: { user: mockPrismaUser() },
}));
```

### Query Unit Tests

Mock Prisma at the module level and assert on method call arguments:

```js
vi.mock('../../../lib/prisma.js', () => ({
  prisma: { user: mockPrismaUser() },
}));

it('filters by role', async () => {
  prisma.user.findMany.mockResolvedValue([]);
  await searchUsers({ role: 'ADMIN' });
  expect(prisma.user.findMany).toHaveBeenCalledWith(
    expect.objectContaining({
      where: expect.objectContaining({ role: 'ADMIN' }),
    })
  );
});
```

### Integration Tests

Integration tests build a fresh Express app in `beforeEach`, mount just the router under test, and use a mocked auth middleware that bypasses real JWT validation:

```js
vi.mock('../../middleware/auth/auth.middleware.js', () => ({
  isAuthenticated: vi.fn((req, res, next) => {
    req.user = { id: 1, username: 'admin', role: 'ADMIN' };
    next();
  }),
}));

beforeEach(() => {
  app = express();
  app.use(express.json());
  app.use('/search', searchRouter);
  app.use((err, req, res, next) => {
    res.status(err.statusCode || 500).json({ message: err.message });
  });
});
```

---

## What to Test

### Client components

| Scenario                                                | Test it |
| ------------------------------------------------------- | ------- |
| Renders the right content given props                   | ✅      |
| Calls callbacks with the right arguments on interaction | ✅      |
| Conditional rendering based on props/state              | ✅      |
| Loading / error / empty states                          | ✅      |
| Navigation calls (`mockNavigate`)                       | ✅      |
| Internal implementation details                         | ✗       |

### Server query functions

| Scenario                                     | Test it |
| -------------------------------------------- | ------- |
| Prisma called with correct `where` clause    | ✅      |
| Sort field whitelisting (invalid → fallback) | ✅      |
| Date range boundaries (`gte`/`lte`)          | ✅      |
| Return value passed through correctly        | ✅      |

### Server integration

| Scenario                                    | Test it |
| ------------------------------------------- | ------- |
| Correct HTTP status for valid request       | ✅      |
| Correct response shape                      | ✅      |
| 400 for invalid input                       | ✅      |
| 500 when query layer throws                 | ✅      |
| Auth middleware applied (401 without token) | ✅      |
