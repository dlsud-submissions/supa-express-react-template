import { supabase } from '../../../lib/supabase.js';

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
      .select('id, username, role, created_at, last_login')
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
      .select('id, username, role, created_at, last_login')
      .eq('id', userId)
      .single();
  },
};
