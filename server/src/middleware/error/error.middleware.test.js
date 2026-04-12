import { beforeEach, describe, expect, it } from 'vitest';
import { globalErrorHandler } from './error.middleware.js';

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

  it('should use statusCode and status from AppError subclasses', () => {
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
