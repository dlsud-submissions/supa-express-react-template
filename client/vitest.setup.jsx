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
// Individual test files can override specific methods with:
//   vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce(...)
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
        getSession: vi.fn(),
        onAuthStateChange: vi.fn(() => ({
          data: { subscription: { unsubscribe: vi.fn() } },
        })),
      },
      from: vi.fn(() => queryChain),
      _queryChain: queryChain,
    },
  };
});

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
