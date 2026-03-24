import { describe, it, expect, vi, beforeEach } from 'vitest';
import { globalErrorHandler } from './error.middleware.js';
import { clearAuthCookie } from '../../utils/auth/cookie/cookie.js';

// Mock cookie utility to verify clearing behavior
vi.mock('../../utils/auth/cookie/cookie.js', () => ({
  clearAuthCookie: vi.fn(),
}));

describe('Global Error Handler Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    ({ req, res, next } = mockExpressContext());
  });

  it('should format a generic Error into a 500 JSON response', () => {
    // --- Arrange ---
    const genericError = new Error('Something went wrong');

    // --- Act ---
    globalErrorHandler(genericError, req, res, next);

    // --- Assert ---
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Something went wrong',
      errors: [],
    });
  });

  it('should use status and statusCode provided by AppError subclasses', () => {
    // --- Arrange ---
    const customError = {
      message: 'Resource not found',
      statusCode: 404,
      status: 'fail',
    };

    // --- Act ---
    globalErrorHandler(customError, req, res, next);

    // --- Assert ---
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'fail',
        message: 'Resource not found',
      })
    );
  });

  it('should clear auth cookie when a 401 error occurs', () => {
    // --- Arrange ---
    const authError = { message: 'Unauthorized access', statusCode: 401 };

    // --- Act ---
    globalErrorHandler(authError, req, res, next);

    // --- Assert ---
    expect(clearAuthCookie).toHaveBeenCalledWith(res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('should include validation error arrays in the response', () => {
    // --- Arrange ---
    const validationError = {
      message: 'Validation failed',
      statusCode: 400,
      errors: [{ msg: 'Invalid email' }, { msg: 'Password too short' }],
    };

    // --- Act ---
    globalErrorHandler(validationError, req, res, next);

    // --- Assert ---
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Validation failed',
      errors: [{ msg: 'Invalid email' }, { msg: 'Password too short' }],
    });
  });
});
