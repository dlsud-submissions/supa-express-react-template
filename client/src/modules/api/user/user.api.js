import { supabase } from '../../../lib/supabase.js';

const USER_PROFILE_FIELDS =
  'id, username, role, avatar_url, provider, username_confirmed, created_at, last_login';

/**
 * Service for user-related queries via Supabase.
 * - Replaces fetch-based Express /api/user/* endpoints.
 * - Return shapes are { data, error } from Supabase — callers handle both.
 */
export const userApi = {
  /**
   * Fetches the profile row for the currently authenticated user.
   * - Reads auth.uid() from the active session; RLS enforces ownership.
   * @returns {Promise<{ data: Object|null, error: Object|null }>}
   */
  getProfile: async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return { data: null, error: { message: 'No active session' } };
    }

    return supabase
      .from('users')
      .select(USER_PROFILE_FIELDS)
      .eq('id', session.user.id)
      .single();
  },

  /**
   * Fetches a specific user record by UUID.
   * - RLS restricts this to ADMIN and SUPER_ADMIN roles.
   * @param {string} userId - The target user's UUID.
   * @returns {Promise<{ data: Object|null, error: Object|null }>}
   */
  getById: async (userId) => {
    return supabase
      .from('users')
      .select(USER_PROFILE_FIELDS)
      .eq('id', userId)
      .single();
  },

  /**
   * Updates the current user's username and marks it as confirmed.
   * - Requires an authenticated session and an RLS policy for self-updates.
   * @param {string} username - The new username selected by the user.
   * @returns {Promise<{ data: Object|null, error: Object|null }>}
   */
  updateUsername: async (username) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return { data: null, error: { message: 'No active session' } };
    }

    return supabase
      .from('users')
      .update({
        username,
        username_confirmed: true,
      })
      .eq('id', session.user.id)
      .select(USER_PROFILE_FIELDS)
      .single();
  },
};
