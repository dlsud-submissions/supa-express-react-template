import { describe, it, expect } from 'vitest';
import { signupSchema } from './auth.validator';

/**
 * Unit tests for client-side auth validation schemas.
 * - Validates that Zod correctly identifies malformed input.
 */
describe('Auth Client Validators', () => {
  it('should invalidate a username with special characters', () => {
    // --- Arrange ---
    // Define input with invalid characters in username
    const invalidData = {
      username: 'user@name',
      password: 'Password1',
      confirmPassword: 'Password1',
    };

    // --- Act ---
    // Run validation against the signup schema
    const result = signupSchema.safeParse(invalidData);

    // --- Assert ---
    // Ensure validation failed and returned correct error message
    expect(result.success).toBe(false);
    expect(result.error.issues[0].message).toContain(
      'Only letters, numbers, and underscores'
    );
  });

  it('should invalidate mismatching passwords', () => {
    // --- Arrange ---
    // Define input with non-matching password fields
    const mismatchData = {
      username: 'validUser',
      password: 'Password1',
      confirmPassword: 'WrongPassword1',
    };

    // --- Act ---
    // Run validation against the signup schema
    const result = signupSchema.safeParse(mismatchData);

    // --- Assert ---
    // Verify schema catches the mismatch via refinement
    expect(result.success).toBe(false);
    expect(result.error.issues[0].message).toBe("Passwords don't match");
  });
});