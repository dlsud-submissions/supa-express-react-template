import { supabase } from '../../../lib/supabase.js';

/**
 * Service for authentication-related calls via Supabase Auth SDK.
 * - Replaces all previous fetch-based Express auth endpoints.
 * - Return shapes are { data, error } from Supabase — callers handle both.
 */
export const authApi = {
  /**
   * Registers a new user via Supabase Auth.
   * - Email is derived from username using the app.local convention.
   * - Username is stored in user_metadata so the DB trigger can read it.
   * @param {Object} userData - Contains username and password.
   * @returns {Promise<{ data, error }>}
   */
  signup: async ({ email, password }) => {
    return supabase.auth.signUp({
      email,
      password,
    });
  },

  /**
   * Authenticates a user via Supabase Auth.
   * @param {Object} credentials - Contains email and password.
   * @returns {Promise<{ data, error }>}
   */
  login: async ({ email, password }) => {
    return supabase.auth.signInWithPassword({
      email,
      password,
    });
  },

  /**
   * Sends an OTP via the server-side OTP API.
   * @param {string} userId
   * @param {string} email
   * @param {string} purpose
   */
  sendOtp: async (userId, email, purpose) => {
    const response = await fetch('/api/otp/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, email, purpose }),
    });

    return response.json();
  },

  /**
   * Verifies an OTP via the server-side OTP API.
   * @param {string} userId
   * @param {string} token
   * @param {string} purpose
   */
  verifyOtp: async (userId, token, purpose) => {
    const response = await fetch('/api/otp/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, token, purpose }),
    });

    return response.json();
  },

  /**
   * Initiates Google OAuth sign-in via Supabase Auth.
   * - Redirects the browser to Google's consent screen.
   * - On return, Supabase exchanges the code and fires onAuthStateChange.
   * @returns {Promise<{ error }>}
   */
  loginWithGoogle: async () => {
    return supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  },

  /**
   * Signs the current user out and clears the local session.
   * @returns {Promise<{ error }>}
   */
  logout: async () => {
    return supabase.auth.signOut();
  },

  /**
   * Returns the current session if one exists.
   * @returns {Promise<{ data: { session }, error }>}
   */
  checkStatus: async () => {
    return supabase.auth.getSession();
  },
};
