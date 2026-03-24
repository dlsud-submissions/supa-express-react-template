import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

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

  global.fetch = vi.fn();

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
