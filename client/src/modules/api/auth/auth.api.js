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
  signup: async ({ username, password }) => {
    return supabase.auth.signUp({
      email: `${username}@app.local`,
      password,
      options: {
        data: { username },
      },
    });
  },

  /**
   * Authenticates a user via Supabase Auth.
   * - Email is derived from username using the app.local convention.
   * @param {Object} credentials - Contains username and password.
   * @returns {Promise<{ data, error }>}
   */
  login: async ({ username, password }) => {
    return supabase.auth.signInWithPassword({
      email: `${username}@app.local`,
      password,
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
