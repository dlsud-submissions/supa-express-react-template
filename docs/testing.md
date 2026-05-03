# Testing Guide

Conventions, patterns, and gotchas for writing tests in this project.

---

## Running Tests

```bash
# Client - watch mode
cd client && npm run test:watch

# Client - run once (CI / verification)
cd client && npm run test:run

# Server - watch mode
cd server && npm run test:watch

# Server - run once
cd server && npm test
```

---

## Client Tests (Vitest + React Testing Library)

### Setup

`client/vitest.setup.jsx` runs before every test file and handles:

- `@testing-library/jest-dom` matchers
- Lucide icon mocks
- A global Supabase client mock
- `localStorage` and `window.location` stubs
- A global `react-router` mock for `useNavigate`, `useRouteError`, and `Navigate`

### Custom Render

Always import `render` from the testing utilities, not directly from
RTL:

```jsx
import { render, screen } from '../../../modules/utils/testing/testing.utils';
```

`customRender` wraps the component in `MemoryRouter + ThemeProvider +
ToastProvider + AuthProvider`, so routing hooks and context hooks work
without manual setup.

---

## Supabase Mock Pattern

`vitest.setup.jsx` registers a global mock for
`client/src/lib/supabase.js` that stubs both `supabase.auth.*` and the
`supabase.from()` query builder chain. Most tests should import
`supabase` and override only the specific behavior they need.

### Auth stubs

```jsx
import { supabase } from '../../../lib/supabase.js';

vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({
  data: { session: { user: { id: 'uuid-1' } } },
  error: null,
});

vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({
  data: null,
  error: { message: 'Invalid login credentials' },
});
```

### OAuth mock pattern

Use the same global auth mock for Google OAuth:

```jsx
import { supabase } from '../../../lib/supabase.js';

vi.mocked(supabase.auth.signInWithOAuth).mockResolvedValueOnce({
  data: {
    provider: 'google',
    url: 'https://accounts.google.com/o/oauth2/v2/auth',
  },
  error: null,
});

vi.mocked(supabase.auth.signInWithOAuth).mockResolvedValueOnce({
  data: null,
  error: { message: 'Provider is not enabled' },
});
```

This is the preferred pattern for:

- `AuthProvider.test.jsx`
- `LoginForm.test.jsx`
- `SignupForm.test.jsx`

### Query chain stubs

The query builder chain is available via `supabase._queryChain`. Each
method returns the chain by default, so tests usually only need to stub
the terminal method.

```jsx
import { supabase } from '../../../lib/supabase.js';

supabase._queryChain.single.mockResolvedValueOnce({
  data: { id: 'uuid-1', username: 'alice', role: 'USER' },
  error: null,
});

supabase._queryChain.order.mockResolvedValue({
  data: [{ id: 'uuid-1', username: 'alice', role: 'USER' }],
  error: null,
});
```

### Simulating auth state changes

`AuthProvider` tests capture the `onAuthStateChange` callback so they
can fire synthetic auth events:

```jsx
const captureAuthStateChange = () => {
  let changeCallback;
  vi.mocked(supabase.auth.onAuthStateChange).mockImplementation((cb) => {
    changeCallback = cb;
    return { data: { subscription: { unsubscribe: vi.fn() } } };
  });
  return () => changeCallback;
};
```

---

## Auth Mock Pattern

`customRender` wraps the real `AuthProvider`, which performs async auth
work on mount. For component tests that use `useAuth`, prefer this
mock:

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

### `username_confirmed` test data

The first-login OAuth flow branches on `provider` and
`username_confirmed`, so mocked user objects should set those fields
explicitly:

```jsx
vi.mocked(useAuth).mockReturnValue({
  user: {
    id: 'user-123',
    username: 'user_abcd',
    role: 'USER',
    provider: 'google',
    username_confirmed: false,
  },
});
```

Recommended cases:

- `provider: 'google', username_confirmed: false` -> redirect to
  `/auth/complete-profile`
- `provider: 'google', username_confirmed: true` -> go directly to the
  dashboard
- `provider: 'email', username_confirmed: true` -> never enter the
  completion flow

---

## API Mock Pattern

Mock the API module directly in component and page tests. Do not reach
into `supabase` from a component test when the component already uses
an API wrapper.

```jsx
vi.mock('../../modules/api/admin/admin.api', () => ({
  adminApi: {
    getAllUsers: vi.fn(),
    promoteUser: vi.fn(),
    demoteUser: vi.fn(),
  },
}));
```

For API module unit tests, mock `supabase` directly because that is
what the module calls.

---

## Mocking `useNavigate`

`vitest.setup.jsx` already stubs `useNavigate` globally. To assert
navigation in a specific test, override it at the module level:

```jsx
const mockNavigate = vi.fn();

vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, useNavigate: () => mockNavigate };
});
```

---

## Async Components

Use `waitFor` for assertions that depend on async state:

```jsx
await waitFor(() => {
  expect(screen.getByText('alice')).toBeInTheDocument();
});
```

### "Renders Nothing" Tests

`customRender` always adds wrapper markup, so `container.firstChild` is
not a reliable null check. Assert against visible app content instead.

### Portal Components

Components that use `createPortal` render into `document.body`. RTL's
`screen` queries search the whole document by default, so portalled
content is still found normally.

---

## Server Tests (Vitest + Supertest)

The server contains only middleware. All business logic lives in the
Supabase-backed client API modules.

`server/vitest.setup.js` provides a reusable Express mock context:

```js
const { req, res, next } = mockExpressContext();
```

---

## What to Test

### Client components

| Scenario                                                | Test it |
| ------------------------------------------------------- | ------- |
| Renders the right content given props                   | Yes     |
| Calls callbacks with the right arguments on interaction | Yes     |
| Conditional rendering based on props/state              | Yes     |
| Loading / error / empty states                          | Yes     |
| Navigation calls (`mockNavigate`)                       | Yes     |
| Internal implementation details                         | No      |

OAuth-specific coverage to keep:

| Component / Flow                | What to assert |
| ------------------------------- | -------------- |
| `OAuthCallback`                 | Spinner, role redirect, error toast redirect, complete-profile redirect for unconfirmed Google users |
| `GoogleAuthButton`              | Label, logo, click callback, loading/disabled state |
| `AuthProvider.loginWithGoogle`  | `signInWithOAuth` args include `provider: 'google'` and `/auth/callback` |
| `LoginForm` / `SignupForm`      | Google button render, click behavior, loading state, provider error toast |
| `CompleteProfile`               | Username validation, successful `updateUsername`, redirect after save |

### Client API modules

| Scenario                                         | Test it |
| ------------------------------------------------ | ------- |
| Supabase SDK called with correct arguments       | Yes     |
| Query chain filters applied correctly            | Yes     |
| Sort column whitelisting (invalid -> fallback)   | Yes     |
| Error shape `{ data, error }` returned correctly | Yes     |
| OAuth profile writes (`updateUsername`)          | Yes     |

### Server middleware

| Scenario                                     | Test it |
| -------------------------------------------- | ------- |
| Middleware stack registered                  | Yes     |
| Error handler returns correct HTTP status    | Yes     |
| Validation error arrays included in response | Yes     |
