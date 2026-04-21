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
// IMPORTANT: getSession MUST always return a Promise because AuthProvider
// calls supabase.auth.getSession().then(...). We restore the default
// resolved value after each vi.clearAllMocks() call.
// ---------------------------------------------------------------------------
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

  // Make every chain method return the chain so calls can be composed
  Object.keys(queryChain).forEach((key) => {
    queryChain[key].mockReturnValue(queryChain);
  });

  return {
    supabase: {
      auth: {
        signUp: vi.fn(),
        signInWithPassword: vi.fn(),
        signOut: vi.fn(),
        // Must return a resolved Promise — AuthProvider calls .getSession().then(...)
        getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
        onAuthStateChange: vi.fn(() => ({
          data: { subscription: { unsubscribe: vi.fn() } },
        })),
      },
      from: vi.fn(() => queryChain),
      _queryChain: queryChain,
    },
  };
});

// After each test, vi.clearAllMocks() wipes mock implementations (including
// the mockResolvedValue on getSession). Restore safe defaults so any
// AuthProvider that mounts in the next test never receives undefined.then().
// We use a dynamic import inside a separate afterEach registered after the
// mock factory has run.
const restoreSupabaseDefaults = async () => {
  const { supabase } = await import('./src/lib/supabase.js');
  supabase.auth.getSession.mockResolvedValue({ data: { session: null } });
  supabase.auth.onAuthStateChange.mockReturnValue({
    data: { subscription: { unsubscribe: vi.fn() } },
  });
  const chain = supabase._queryChain;
  Object.keys(chain).forEach((key) => chain[key].mockReturnValue(chain));
  supabase.from.mockReturnValue(chain);
};

afterEach(restoreSupabaseDefaults);

// Initialize Browser API Mocks
if (typeof window !== 'undefined') {
  // Mock localStorage
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

// Mock React Router navigation and error hooks
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useNavigate: vi.fn(() => vi.fn()),
    useRouteError: vi.fn(),
    Navigate: vi.fn(() => null),
  };
});
