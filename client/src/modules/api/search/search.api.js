import { supabase } from '../../../lib/supabase.js';

// Whitelist of valid sort columns — prevents injection via sort params
const VALID_SORT_FIELDS = ['username', 'created_at', 'last_login', 'role'];

/**
 * Service for search queries via Supabase.
 * - Replaces fetch-based Express /api/search endpoint.
 * - Supports partial username match, role filter, date range, and sort.
 * - Return shape is { data, error } from Supabase — callers handle both.
 */
export const searchApi = {
  /**
   * Searches users with optional filters and sorting.
   * @param {Object} params
   * @param {string} [params.section='users'] - Data section (only 'users' currently).
   * @param {string} [params.q=''] - Partial username to search (case-insensitive).
   * @param {string} [params.role] - Role filter (USER | ADMIN | SUPER_ADMIN).
   * @param {string} [params.joinedAfter] - ISO date string — include users joined on or after.
   * @param {string} [params.joinedBefore] - ISO date string — include users joined on or before.
   * @param {string} [params.sortBy='created_at'] - Column to sort by (whitelisted).
   * @param {string} [params.sortDir='desc'] - Sort direction ('asc' | 'desc').
   * @returns {Promise<{ data: Array|null, error: Object|null }>}
   */
  search: async ({
    section = 'users',
    q = '',
    role,
    joinedAfter,
    joinedBefore,
    sortBy = 'created_at',
    sortDir = 'desc',
  } = {}) => {
    // Only 'users' section is supported currently
    if (section !== 'users') {
      return {
        data: null,
        error: { message: `Invalid section: '${section}'` },
      };
    }

    // Whitelist sort column
    const safeSortBy = VALID_SORT_FIELDS.includes(sortBy)
      ? sortBy
      : 'created_at';
    const ascending = sortDir === 'asc';

    let query = supabase
      .from('users')
      .select('id, username, role, created_at, last_login')
      .order(safeSortBy, { ascending });

    // Partial username match — ilike is case-insensitive
    if (q) {
      query = query.ilike('username', `%${q}%`);
    }

    // Role filter
    if (role) {
      query = query.eq('role', role);
    }

    // Date range filters — start of day / end of day in UTC
    if (joinedAfter) {
      query = query.gte('created_at', `${joinedAfter}T00:00:00.000Z`);
    }
    if (joinedBefore) {
      query = query.lte('created_at', `${joinedBefore}T23:59:59.999Z`);
    }

    return query;
  },
};
