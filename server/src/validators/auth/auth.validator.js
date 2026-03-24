import { body } from 'express-validator';
import * as userQueries from '../../db/queries/user/user.queries.js';

// Centralized error message fragments
const passwordLengthErr = 'must be at least 6 characters long.';

/**
 * Signup Validation Chain.
 * - Validates username length, format, and database uniqueness via Prisma.
 * - Enforces password complexity (length, casing, and digits).
 * - Verifies that the confirmation password matches the primary password.
 * @type {Array<import('express-validator').ValidationChain>}
 */
export const validateSignup = [
  // Validate username presence and format
  body('username')
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('Username must be between 3 and 20 characters.')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores.')
    // Perform async database check for username uniqueness
    .custom(async (username) => {
      const user = await userQueries.getUserByUsername(username);
      if (user) {
        throw new Error('Username already taken.');
      }
      return true;
    }),

  // Validate password complexity requirements
  body('password')
    .isLength({ min: 6 })
    .withMessage(`Password ${passwordLengthErr}`)
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter.')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase letter.')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number.'),

  // Validate that passwords match
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Password confirmation does not match password.');
    }
    return true;
  }),
];

/**
 * Login Validation Chain.
 * - Ensures both username and password fields are populated.
 * @type {Array<import('express-validator').ValidationChain>}
 */
export const validateLogin = [
  // Check for required credentials
  body('username').trim().notEmpty().withMessage('Username is required.'),
  body('password').notEmpty().withMessage('Password is required.'),
];
