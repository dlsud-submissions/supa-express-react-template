const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

/**
 * Service for authentication-related API calls.
 * - Mirrors the backend auth controller functionality.
 * - Centralizes fetch configuration and credential handling.
 */
export const authApi = {
  /**
   * Sends registration data to the server.
   * @param {Object} userData - Contains username and password.
   * @returns {Promise<Response>}
   */
  signup: async (userData) => {
    // Execute Registration Request with credentials to allow guard clearance
    return fetch(`${BASE_URL}/api/auth/sign-up`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(userData),
    });
  },

  /**
   * Authenticates user and establishes session cookie.
   * @param {Object} credentials - Contains username and password.
   * @returns {Promise<Response>}
   */
  login: async (credentials) => {
    // Execute Login Request With Credentials To Capture Secure Cookie
    return fetch(`${BASE_URL}/api/auth/log-in`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(credentials),
    });
  },

  /**
   * Clears the authentication session on the server.
   * @returns {Promise<Response>}
   */
  logout: async () => {
    // Execute Logout Request To Destroy HttpOnly Cookie
    return fetch(`${BASE_URL}/api/auth/log-out`, {
      method: 'GET',
      credentials: 'include',
    });
  },

  /**
   * Verifies current session validity.
   * @returns {Promise<Response>}
   */
  checkStatus: async () => {
    // Execute Identity Check Request
    return fetch(`${BASE_URL}/api/auth/me`, {
      method: 'GET',
      credentials: 'include',
    });
  },
};
