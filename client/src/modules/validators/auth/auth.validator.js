import { z } from 'zod';

/**
 * Zod schema for User Signup.
 * - Mirrors server requirements for length and character types.
 * - Handles cross-field validation for password matching.
 * @type {z.ZodType}
 */
export const signupSchema = z
  .object({
    // Matches server username logic
    username: z
      .string()
      .min(3, 'Username must be at least 3 characters.')
      .max(20, 'Username must be under 20 characters.')
      .regex(
        /^[a-zA-Z0-9_]+$/,
        'Only letters, numbers, and underscores allowed.'
      ),

    // Matches server password complexity
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters.')
      .regex(/[A-Z]/, 'Must contain one uppercase letter.')
      .regex(/[a-z]/, 'Must contain one lowercase letter.')
      .regex(/[0-9]/, 'Must contain one number.'),

    // Field for confirmation check
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'], // Highlights the specific field in error
  });

/**
 * Zod schema for User Login.
 * @type {z.ZodType}
 */
export const loginSchema = z.object({
  username: z.string().min(1, 'Username is required.'),
  password: z.string().min(1, 'Password is required.'),
});
