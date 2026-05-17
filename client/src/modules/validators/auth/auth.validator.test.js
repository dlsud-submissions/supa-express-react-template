import { describe, expect, it } from 'vitest';
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
      email: 'user@example.com',
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
      email: 'valid@example.com',
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

  it('should invalidate a malformed email address', () => {
    // --- Arrange ---
    const invalidData = {
      username: 'validUser',
      email: 'not-an-email',
      password: 'Password1',
      confirmPassword: 'Password1',
    };

    // --- Act ---
    const result = signupSchema.safeParse(invalidData);

    // --- Assert ---
    expect(result.success).toBe(false);
    expect(result.error.issues[0].message).toContain('valid email');
  });

  it('should pass with valid username, email, and matching passwords', () => {
    // --- Arrange ---
    const validData = {
      username: 'validUser',
      email: 'valid@example.com',
      password: 'Password1',
      confirmPassword: 'Password1',
    };

    // --- Act ---
    const result = signupSchema.safeParse(validData);

    // --- Assert ---
    expect(result.success).toBe(true);
  });
});
