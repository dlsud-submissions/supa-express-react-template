/**
 * Base class for all operational errors.
 * - Captures stack traces automatically.
 * - Supports custom HTTP status codes.
 * @extends Error
 */
export class AppError extends Error {
  /**
   * @param {string} message - Human readable error description
   * @param {number} statusCode - HTTP response code (e.g. 404, 400)
   */
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    this.name = this.constructor.name;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Specific error for failed authentication or invalid tokens.
 * @extends AppError
 */
export class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed') {
    super(message, 401);
  }
}

/**
 * Specific error for resource-not-found scenarios.
 * @extends AppError
 */
export class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404);
  }
}

/**
 * Specific error for input validation failures.
 * - Holds an array of specific field errors (e.g. from express-validator).
 * @extends AppError
 */
export class ValidationError extends AppError {
  /**
   * @param {string} message - General error message.
   * @param {Array} errors - Array of validation error objects.
   */
  constructor(message = 'Validation failed', errors = []) {
    super(message, 400);
    this.errors = errors;
  }
}

/**
 * Specific error for insufficient permissions or roles.
 * - Used for 403 Forbidden scenarios.
 * @extends AppError
 */
export class ForbiddenError extends AppError {
  /**
   * @param {string} message - Detailed reason for denial.
   */
  constructor(message = 'Access denied: insufficient privileges') {
    super(message, 403);
  }
}

/**
 * Specific error for resource conflicts.
 * - Used for 409 Conflict scenarios (e.g. duplicate username).
 * @extends AppError
 */
export class ConflictError extends AppError {
  /**
   * @param {string} message - Human readable conflict description.
   */
  constructor(message = 'Resource already exists') {
    super(message, 409);
  }
}
