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
- A global Supabase client mock (see below)
- `localStorage` and `window.location` stubs
- A global `react-router` mock that stubs `useNavigate`, `useRouteError`, and `Navigate`

### Custom Render

Always import `render` from the testing utils, not directly from RTL:

```jsx
import { render, screen } from '../../../modules/utils/testing/testing.utils';
```

`customRender` wraps the component in `MemoryRouter + ThemeProvider + ToastProvider + AuthProvider`, so routing hooks and context hooks work without manual setup.

---

### Supabase Mock Pattern

`vitest.setup.jsx` registers a **global mock** for `client/src/lib/supabase.js`
that stubs both `supabase.auth.*` and the `supabase.from()` query builder chain.
No test file needs to set up its own Supabase mock from scratch — just import
`supabase` and override whatever you need for that test.

`afterEach` in the setup file calls `vi.clearAllMocks()` automatically,
so stubs reset between tests without any manual cleanup.

#### Auth stubs

```jsx
import { supabase } from '../../../lib/supabase.js';

// Override a single method for one test
vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({
  data: { session: { user: { id: 'uuid-1' } } },
  error: null,
});

// Simulate a failed login
vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({
  data: null,
  error: { message: 'Invalid login credentials' },
});
```

#### Query chain stubs

The query builder chain is accessible via `supabase._queryChain`.
Every method (`select`, `eq`, `ilike`, `gte`, `lte`, `order`,
`single`, etc.) returns the chain by default so calls can be composed freely.

```jsx
import { supabase } from '../../../lib/supabase.js';

// Stub the terminal .single() call
supabase._queryChain.single.mockResolvedValueOnce({
  data: { id: 'uuid-1', username: 'alice', role: 'USER' },
  error: null,
});

// Stub the terminal .order() call (list queries)
supabase._queryChain.order.mockResolvedValue({
  data: [{ id: 'uuid-1', username: 'alice', role: 'USER' }],
  error: null,
});
```

#### Simulating auth state changes (AuthProvider tests)

Capture the `onAuthStateChange` callback so tests can fire synthetic events:

```jsx
const captureAuthStateChange = () => {
  let changeCallback;
  vi.mocked(supabase.auth.onAuthStateChange).mockImplementation((cb) => {
    changeCallback = cb;
    return { data: { subscription: { unsubscribe: vi.fn() } } };
  });
  return () => changeCallback;
};

// In the test:
const getCallback = captureAuthStateChange();
renderWithDeps(<TestConsumer />);
await waitFor(() => expect(getCallback()).toBeDefined());

await act(async () => {
  getCallback()('SIGNED_IN', { user: { id: 'uuid-1' } });
});
```

---

### Auth Mock Pattern

`customRender` wraps the real `AuthProvider`, which fires an async
`onAuthStateChange` subscription on mount. Always add this mock to any
test file that renders a component using `useAuth`, to prevent background
state updates from causing `act()` warnings:

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

---

### API Mock Pattern

Mock the api module directly in component/page tests — never reach into
`supabase` from inside a component test when the component already goes
through an api module:

```jsx
vi.mock('../../modules/api/admin/admin.api', () => ({
  adminApi: {
    getAllUsers: vi.fn(),
    promoteUser: vi.fn(),
    demoteUser: vi.fn(),
  },
}));
```

For **api module unit tests** (e.g. `admin.api.test.js`), mock `supabase`
directly since that's what the module calls:

```jsx
import { supabase } from '../../../lib/supabase.js';

// supabase is already mocked globally — just override what you need
supabase._queryChain.order.mockResolvedValue({
  data: [{ id: 'uuid-1', username: 'alice', role: 'USER' }],
  error: null,
});
```

---

### Mocking `useNavigate`

`vitest.setup.jsx` already stubs `useNavigate` globally with `vi.fn(() => vi.fn())`.
To assert navigation in a specific test, override it at the module level:

```jsx
const mockNavigate = vi.fn();
vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, useNavigate: () => mockNavigate };
});
```

---

### Async Components

Use `waitFor` for assertions that depend on async state:

```jsx
await waitFor(() => {
  expect(screen.getByText('alice')).toBeInTheDocument();
});
```

### "Renders Nothing" Tests

`customRender` always adds a wrapper div — `container.firstChild` is never null.
Query for the component's content instead:

```jsx
// ✗ Don't do this
expect(container.firstChild).toBeNull();

// ✓ Do this instead
expect(screen.queryByText(/some content/i)).not.toBeInTheDocument();
```

### Portal Components

Components that use `createPortal` (e.g. `ConfirmationModal`, `UserRowActions`
dropdown) render into `document.body`, outside the component tree. RTL's
`screen` queries the entire document body by default, so portalled content
is found normally with `screen.getByText(...)`.

---

## Server Tests (Vitest + Supertest)

The server contains only middleware — all business logic lives in the
Supabase-backed client api modules.

### Setup

`server/vitest.setup.js` provides one global available in all test files:

```js
// Chainable Express mock
const { req, res, next } = mockExpressContext();
```

### Middleware Tests

Two test files cover the server middleware layer:

- `server/src/middleware/app/app.middleware.test.js` — verifies CORS
  and body parsing middleware are registered; verifies the 4-argument
  error handler is mounted
- `server/src/middleware/error/error.middleware.test.js` — verifies
  error shape, status code passthrough, and validation error arrays

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

### Client api modules

| Scenario                                         | Test it |
| ------------------------------------------------ | ------- |
| Supabase SDK called with correct arguments       | ✅      |
| Query chain filters applied correctly            | ✅      |
| Sort column whitelisting (invalid → fallback)    | ✅      |
| Error shape `{ data, error }` returned correctly | ✅      |

### Server middleware

| Scenario                                     | Test it |
| -------------------------------------------- | ------- |
| Middleware stack registered                  | ✅      |
| Error handler returns correct HTTP status    | ✅      |
| Validation error arrays included in response | ✅      |
