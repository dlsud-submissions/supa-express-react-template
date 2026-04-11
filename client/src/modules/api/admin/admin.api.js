import { supabase } from '../../../lib/supabase.js';

/**
 * Service for administrative queries via Supabase.
 * - Replaces fetch-based Express /api/admin/* endpoints.
 * - Return shapes are { data, error } from Supabase — callers handle both.
 * - RLS on public.users ensures only ADMIN/SUPER_ADMIN can read all rows.
 * - Role updates are restricted to SUPER_ADMIN by RLS policy.
 */
export const adminApi = {
  /**
   * Fetches all users ordered by creation date ascending.
   * @returns {Promise<{ data: Array|null, error: Object|null }>}
   */
  getAllUsers: async () => {
    return supabase
      .from('users')
      .select('id, username, role, created_at')
      .order('created_at', { ascending: true });
  },

  /**
   * Promotes a user to ADMIN role.
   * @param {string} userId - The target user's UUID.
   * @returns {Promise<{ data: Object|null, error: Object|null }>}
   */
  promoteUser: async (userId) => {
    return supabase
      .from('users')
      .update({ role: 'ADMIN' })
      .eq('id', userId)
      .select()
      .single();
  },

  /**
   * Demotes a user back to USER role.
   * @param {string} userId - The target user's UUID.
   * @returns {Promise<{ data: Object|null, error: Object|null }>}
   */
  demoteUser: async (userId) => {
    return supabase
      .from('users')
      .update({ role: 'USER' })
      .eq('id', userId)
      .select()
      .single();
  },
};
