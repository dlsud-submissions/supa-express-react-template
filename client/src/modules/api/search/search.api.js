const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

/**
 * Service for search-related API calls.
 * - Supports section-based search with dynamic filters and sorting.
 * - Serializes all params into a query string for GET requests.
 */
export const searchApi = {
  /**
   * Searches a specific data section with optional filters and sorting.
   * @param {Object} params - Search parameters.
   * @param {string} [params.section='users'] - The data section to search.
   * @param {string} [params.q=''] - The search query string.
   * @param {string} [params.sortBy] - Field to sort by.
   * @param {string} [params.sortDir] - Sort direction ('asc' | 'desc').
   * @param {Object} [params.filters] - Section-specific filter key/value pairs.
   * @returns {Promise<Response>}
   */
  search: async ({
    section = 'users',
    q = '',
    sortBy,
    sortDir,
    ...filters
  } = {}) => {
    // Build params object, stripping undefined values
    const params = {
      section,
      q,
      ...(sortBy && { sortBy }),
      ...(sortDir && { sortDir }),
      ...filters,
    };

    // Serialize to query string
    return fetch(`${BASE_URL}/api/search?${new URLSearchParams(params)}`, {
      method: 'GET',
      credentials: 'include',
    });
  },
};
