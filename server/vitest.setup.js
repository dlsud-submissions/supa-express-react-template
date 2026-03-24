import { afterEach, vi } from 'vitest';

afterEach(() => {
  vi.clearAllMocks();
  vi.resetModules();
});

/**
 * Reusable Express mock factory.
 * - Provides chainable res methods, empty req, and a mock next function.
 * - Available globally in all server tests via mockExpressContext().
 * @returns {{ req: Object, res: Object, next: Function }}
 */
global.mockExpressContext = () => {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  res.send = vi.fn().mockReturnValue(res);
  res.redirect = vi.fn().mockReturnValue(res);
  res.locals = {};

  const req = {};
  const next = vi.fn();

  return { req, res, next };
};

/**
 * Reusable Prisma user model mock factory.
 * - Covers the full set of user methods used across query test files.
 * - Pass into vi.mock as: vi.mock('../lib/prisma.js', () => ({ prisma: { user: mockPrismaUser() } }))
 * @returns {Object} Vitest fn stubs for all Prisma user methods.
 */
global.mockPrismaUser = () => ({
  findMany: vi.fn(),
  findUnique: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
});
