const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

/**
 * Service for user-related API calls.
 * - Handles profile retrieval.
 */
export const userApi = {
  /**
   * Fetches profile details for the authenticated user.
   * @returns {Promise<Response>}
   */
  getProfile: async () => {
    return fetch(`${BASE_URL}/api/user/profile`, {
      method: 'GET',
      credentials: 'include',
    });
  },

  /**
   * Fetches a specific user record by its ID.
   * Primarily used for admin management views.
   * @param {number|string} userId
   * @returns {Promise<Response>}
   */
  getById: async (userId) => {
    return fetch(`${BASE_URL}/api/user/profile/${userId}`, {
      method: 'GET',
      credentials: 'include',
    });
  },
};
