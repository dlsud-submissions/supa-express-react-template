import { AppError } from './AppError.js';

/**
 * Generic internal server error (500).
 * - Used in controllers to wrap uncaught exceptions or DB failures.
 * @extends AppError
 */
export class InternalServerError extends AppError {
  /**
   * @param {string} message - Internal message for server logs.
   */
  constructor(message = 'An unexpected server error occurred') {
    super(message, 500);
  }
}

/**
 * Specific error for external API failures (Google Auth, 2FA).
 * - Useful for the Capstone's external integrations.
 * @extends AppError
 */
export class ExternalServiceError extends AppError {
  /**
   * @param {string} service - The name of the failing service.
   * @param {string} message - Details of the failure.
   */
  constructor(service, message) {
    super(`${service} failure: ${message}`, 500);
    this.service = service;
  }
}
