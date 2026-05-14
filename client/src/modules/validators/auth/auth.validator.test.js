import { describe, expect, it } from 'vitest';
import {
  loginSchema,
  profileSettingsSchema,
  signupSchema,
  usernameFieldSchema,
  usernameSchema,
} from './auth.validator';

/**
 * Unit tests for client-side auth validation schemas.
 * - Validates that Zod correctly identifies malformed input.
 */
describe('Auth Client Validators', () => {
  it('should invalidate an improperly formatted email in signup', () => {
    const invalidData = {
      email: 'not-an-email',
      password: 'Password1',
      confirmPassword: 'Password1',
    };

    const result = signupSchema.safeParse(invalidData);

    expect(result.success).toBe(false);
    expect(result.error.issues[0].message).toContain(
      'Must be a valid email address'
    );
  });

  it('should invalidate an improperly formatted email in login', () => {
    const result = loginSchema.safeParse({
      email: 'not-an-email',
      password: 'Password1',
    });

    expect(result.success).toBe(false);
    expect(result.error.issues[0].message).toBe(
      'Please enter a valid email address.'
    );
  });

  it('should invalidate mismatching passwords', () => {
    // --- Arrange ---
    // Define input with non-matching password fields
    const mismatchData = {
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

  it('should validate a username-only payload for OAuth completion', () => {
    const result = usernameSchema.safeParse({ username: 'fresh_name' });

    expect(result.success).toBe(true);
  });

  it('should share username rules across auth forms', () => {
    const result = usernameFieldSchema.safeParse('no spaces allowed!');

    expect(result.success).toBe(false);
    expect(result.error.issues[0].message).toContain(
      'Only letters, numbers, and underscores'
    );
  });

  it('should validate profile settings with an optional avatar URL', () => {
    const result = profileSettingsSchema.safeParse({
      username: 'fresh_name',
      avatar_url: '',
    });

    expect(result.success).toBe(true);
  });

  it('should invalidate malformed avatar URLs in profile settings', () => {
    const result = profileSettingsSchema.safeParse({
      username: 'fresh_name',
      avatar_url: 'not-a-url',
    });

    expect(result.success).toBe(false);
    expect(result.error.issues[0].message).toBe(
      'Avatar URL must be a valid URL.'
    );
  });
});
