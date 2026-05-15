import { z } from 'zod';

export const emailSchema = z
  .string()
  .email('Must be a valid email address.')
  .min(1, 'Email is required.');

export const passwordSchema = z
  .string()
  .min(6, 'Password must be at least 6 characters.')
  .regex(/[A-Z]/, 'Must contain one uppercase letter.')
  .regex(/[a-z]/, 'Must contain one lowercase letter.')
  .regex(/[0-9]/, 'Must contain one number.');

/**
 * Shared username rules used by signup and OAuth profile completion.
 */
export const usernameFieldSchema = z
  .string()
  .min(3, 'Username must be at least 3 characters.')
  .max(20, 'Username must be under 20 characters.')
  .regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers, and underscores allowed.');

export const usernameSchema = z.object({ username: usernameFieldSchema });

export const profileSettingsSchema = z.object({
  username: usernameFieldSchema,
  avatar_url: z
    .string()
    .url('Avatar URL must be a valid URL.')
    .or(z.literal('')),
});

export const signupSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
});

export const passwordChangeSchema = z
  .object({
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });
