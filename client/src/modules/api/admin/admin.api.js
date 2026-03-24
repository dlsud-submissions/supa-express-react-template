const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

/**
 * Service for administrative API calls.
 * - Handles user management and role modification.
 */
export const adminApi = {
  /**
   * Fetches all users for the management dashboard.
   * @returns {Promise<Response>}
   */
  getAllUsers: async () => {
    // GET request to retrieve user list
    return fetch(`${BASE_URL}/api/admin/users`, {
      method: 'GET',
      credentials: 'include',
    });
  },

  /**
   * Promotes a user to ADMIN role.
   * @param {number|string} userId
   * @returns {Promise<Response>}
   */
  promoteUser: async (userId) => {
    // POST request to promote specific ID
    return fetch(`${BASE_URL}/api/admin/users/${userId}/promote`, {
      method: 'POST',
      credentials: 'include',
    });
  },

  /**
   * Demotes an admin to USER role.
   * @param {number|string} userId
   * @returns {Promise<Response>}
   */
  demoteUser: async (userId) => {
    // POST request to demote specific ID
    return fetch(`${BASE_URL}/api/admin/users/${userId}/demote`, {
      method: 'POST',
      credentials: 'include',
    });
  },
};
