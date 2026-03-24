import { vi, describe, it, expect } from 'vitest';
import * as authValidator from './auth.validator.js';
import * as userQueries from '../../db/queries/user/user.queries.js';

// Mock userQueries to bypass real database logic and isolate validator testing
vi.mock('../../db/queries/user/user.queries.js', () => ({
  getUserByUsername: vi.fn(),
}));

/**
 * Executes express-validator chains against mock data.
 * - Wraps request body in a mock object.
 * - Runs all validation chains in parallel.
 * - Collects results via validationResult.
 * @param {Array} validations - The array of ValidationChains to test.
 * @param {Object} data - Mock request body (req.body).
 * @returns {Promise<Array>} Array of error objects (msg, path, etc.).
 */
const runValidation = async (validations, data) => {
  const req = { body: data };

  // Trigger internal execution of each validator chain
  await Promise.all(validations.map((validation) => validation.run(req)));

  const { validationResult } = await import('express-validator');
  return validationResult(req).array();
};

describe('authValidator module', () => {
  describe('validateSignup', () => {
    it('should fail if username contains invalid characters', async () => {
      // --- Arrange ---
      const data = {
        username: 'user@123',
        password: 'Password1',
        confirmPassword: 'Password1',
      };

      // --- Act ---
      const errors = await runValidation(authValidator.validateSignup, data);

      // --- Assert ---
      expect(
        errors.some((e) => e.msg.includes('letters, numbers, and underscores'))
      ).toBe(true);
    });

    it('should fail if username is already taken in the database', async () => {
      // --- Arrange ---
      const data = {
        username: 'existingUser',
        password: 'Password1',
        confirmPassword: 'Password1',
      };
      vi.mocked(userQueries.getUserByUsername).mockResolvedValue({
        id: 1,
        username: 'existingUser',
      });

      // --- Act ---
      const errors = await runValidation(authValidator.validateSignup, data);

      // --- Assert ---
      expect(errors.some((e) => e.msg === 'Username already taken.')).toBe(
        true
      );
      expect(userQueries.getUserByUsername).toHaveBeenCalledWith(
        'existingUser'
      );
    });

    it('should fail if passwords do not match', async () => {
      // --- Arrange ---
      const data = {
        username: 'validUser',
        password: 'Password1',
        confirmPassword: 'Mismatch1',
      };
      vi.mocked(userQueries.getUserByUsername).mockResolvedValue(null);

      // --- Act ---
      const errors = await runValidation(authValidator.validateSignup, data);

      // --- Assert ---
      expect(
        errors.some((e) => e.msg.includes('confirmation does not match'))
      ).toBe(true);
    });
  });

  describe('validateLogin', () => {
    it('should fail if required fields are missing', async () => {
      // --- Arrange ---
      const data = { username: '', password: '' };

      // --- Act ---
      const errors = await runValidation(authValidator.validateLogin, data);

      // --- Assert ---
      expect(errors.length).toBe(2);
      const messages = errors.map((e) => e.msg);
      expect(messages).toContain('Username is required.');
      expect(messages).toContain('Password is required.');
    });
  });
});
