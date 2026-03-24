import { cookieOptions } from '../../../config/cookieOptions.js';

/**
 * Attaches a JWT token to the response as a secure cookie.
 * @param {Object} res - Express response object.
 * @param {string} token - The signed JWT string.
 */
export const setAuthCookie = (res, token) => {
  res.cookie('token', token, cookieOptions);
};

/**
 * Commands the browser to remove the authentication cookie.
 * - Uses the exact same options to ensure the browser identifies the correct cookie.
 * @param {Object} res - Express response object.
 */
export const clearAuthCookie = (res) => {
  // Overwriting maxAge to 0 forces immediate expiration
  res.clearCookie('token', { ...cookieOptions, maxAge: 0 });
};
