import { vi, describe, it, expect, beforeEach } from 'vitest';
import express from 'express';
import * as appMiddleware from './app.middleware.js';

// Isolate app setup by mocking external dependencies
vi.mock('../../config/corsOptions.js', () => ({
  default: { origin: '*' },
}));

// Mock cookie utility to prevent reference errors when error handler is triggered
vi.mock('../../utils/auth/cookie/cookie.js', () => ({
  clearAuthCookie: vi.fn(),
}));

vi.mock('passport', () => ({
  default: { initialize: vi.fn(() => (req, res, next) => next()) },
}));

describe('app middleware module', () => {
  let app;

  beforeEach(() => {
    // Prepare fresh express instance for each test
    app = express();
    vi.spyOn(app, 'use');
  });

  describe('configureMiddleware()', () => {
    it('should register essential global middlewares', () => {
      // --- Act ---
      // Run global configuration
      appMiddleware.configureMiddleware(app);

      // --- Assert ---
      // Check for middleware registration
      expect(app.use).toHaveBeenCalled();
    });

    it('should set res.locals.currentUser from req.user', () => {
      // --- Arrange ---
      appMiddleware.configureMiddleware(app);

      // Identify the identity middleware in the express stack
      const identityMiddleware = app.use.mock.calls.find((call) =>
        call[0].toString().includes('res.locals.currentUser')
      )[0];

      const req = { user: { id: 1, username: 'tester' } };
      const res = { locals: {} };
      const next = vi.fn();

      // --- Act ---
      // Run the middleware function
      identityMiddleware(req, res, next);

      // --- Assert ---
      // Verify user propagation to locals
      expect(res.locals.currentUser).toEqual(req.user);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('configureErrorHandling()', () => {
    it('should register an error-handling middleware with 4 arguments', () => {
      // --- Arrange ---
      // Initialize error handling
      appMiddleware.configureErrorHandling(app);

      // Locate function with 4 arguments within any .use() call
      const errorHandler = app.use.mock.calls
        .map((call) =>
          call.find((arg) => typeof arg === 'function' && arg.length === 4)
        )
        .find((fn) => fn !== undefined);

      // Guard against missing handler
      if (!errorHandler) {
        throw new Error(
          'Could not find 4-argument error handler in express stack'
        );
      }

      // Mock error object with standard status properties
      const err = { statusCode: 401, status: 'fail', message: 'Unauthorized' };
      const req = {};

      // Prepare response mock with JSON support
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
        send: vi.fn().mockReturnThis(),
      };
      const next = vi.fn();

      // Silence console output during error simulation
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      // --- Act ---
      // Trigger error handler
      errorHandler(err, req, res, next);

      // --- Assert ---
      // Confirm error details are sent to client via JSON
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Unauthorized',
        })
      );

      consoleSpy.mockRestore();
    });
  });
});
