import * as matchers from '@testing-library/jest-dom/matchers';
import { cleanup } from '@testing-library/react';
import { afterEach, expect, vi } from 'vitest';

expect.extend(matchers);

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.unstubAllGlobals();
});

// Mock Lucide icons to prevent SVG bloat in snapshots
vi.mock('lucide-react', async () => {
  const actual = await vi.importActual('lucide-react');
  return Object.keys(actual).reduce((acc, curr) => {
    acc[curr] = () => <div data-testid={`icon-${curr}`} />;
    return acc;
  }, {});
});

// ---------------------------------------------------------------------------
// Global Supabase client mock
// ---------------------------------------------------------------------------
// Provides a chainable stub for supabase.from() queries and stubs for all
// supabase.auth.* methods used across the test suite.
//
// KEY DESIGN: We capture the mock object in a module-level variable so that
// the afterEach restore function can reference it synchronously — no dynamic
// import needed. Dynamic import breaks when individual test files define their
// own local vi.mock for supabase.js (the api unit tests), because the import
// resolves to THEIR local mock instead of this global one.
//
// Individual test files can override methods with:
//   vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce(...)
// ---------------------------------------------------------------------------

// Holds the reference set synchronously inside the factory below.
let _supabaseMock = null;

vi.mock('./src/lib/supabase.js', () => {
  const queryChain = {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    eq: vi.fn(),
    neq: vi.fn(),
    ilike: vi.fn(),
    gte: vi.fn(),
    lte: vi.fn(),
    order: vi.fn(),
    single: vi.fn(),
    limit: vi.fn(),
  };

  Object.keys(queryChain).forEach((key) => {
    queryChain[key].mockReturnValue(queryChain);
  });

  const supabase = {
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      // MUST return a Promise — AuthProvider calls .getSession().then(...)
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
    },
    from: vi.fn(() => queryChain),
    _queryChain: queryChain,
  };

  // Capture reference for the afterEach restore below.
  _supabaseMock = supabase;

  return { supabase };
});

// ---------------------------------------------------------------------------
// Restore safe Supabase defaults after each test.
//
// vi.clearAllMocks() resets ALL mock implementations, including the
// mockResolvedValue on getSession. If the next test mounts any component
// that uses the real AuthProvider (even briefly), it calls
// getSession().then(...) and crashes because the mock now returns undefined.
//
// We restore synchronously using the captured _supabaseMock reference.
// This only runs when _supabaseMock is non-null (i.e. for test files that
// use this global mock). Test files with their own local supabase mock are
// unaffected — they manage their own chain in beforeEach.
// ---------------------------------------------------------------------------
afterEach(() => {
  if (!_supabaseMock) return;

  _supabaseMock.auth.getSession.mockResolvedValue({ data: { session: null } });
  _supabaseMock.auth.onAuthStateChange.mockReturnValue({
    data: { subscription: { unsubscribe: vi.fn() } },
  });

  const chain = _supabaseMock._queryChain;
  Object.keys(chain).forEach((key) => chain[key].mockReturnValue(chain));
  _supabaseMock.from.mockReturnValue(chain);
});

// ---------------------------------------------------------------------------
// Browser API mocks
// ---------------------------------------------------------------------------
if (typeof window !== 'undefined') {
  let store = {};
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: (key) => store[key] || null,
      setItem: (key, value) => {
        store[key] = String(value);
      },
      removeItem: (key) => {
        delete store[key];
      },
      clear: () => {
        store = {};
      },
    },
    writable: true,
  });

  Object.defineProperty(window, 'location', {
    value: { reload: vi.fn(), assign: vi.fn(), replace: vi.fn() },
    writable: true,
  });
}

// ---------------------------------------------------------------------------
// React Router mocks
// ---------------------------------------------------------------------------
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useNavigate: vi.fn(() => vi.fn()),
    useRouteError: vi.fn(),
    Navigate: vi.fn(() => null),
  };
});
