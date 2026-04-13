import express from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as appMiddleware from './app.middleware.js';

vi.mock('../../config/corsOptions.js', () => ({
  default: { origin: '*' },
}));

describe('app middleware module', () => {
  let app;

  beforeEach(() => {
    app = express();
    vi.spyOn(app, 'use');
  });

  describe('configureMiddleware()', () => {
    it('should register global middlewares', () => {
      // --- Act ---
      appMiddleware.configureMiddleware(app);

      // --- Assert ---
      expect(app.use).toHaveBeenCalled();
    });
  });

  describe('configureErrorHandling()', () => {
    it('should register a 4-argument error handler', () => {
      // --- Arrange ---
      appMiddleware.configureErrorHandling(app);

      const errorHandler = app.use.mock.calls
        .map((call) =>
          call.find((arg) => typeof arg === 'function' && arg.length === 4)
        )
        .find((fn) => fn !== undefined);

      if (!errorHandler) {
        throw new Error('No 4-argument error handler found in express stack');
      }

      const err = { statusCode: 400, status: 'fail', message: 'Bad request' };
      const req = {};
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      };
      const next = vi.fn();

      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      // --- Act ---
      errorHandler(err, req, res, next);

      // --- Assert ---
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Bad request' })
      );

      consoleSpy.mockRestore();
    });
  });
});
