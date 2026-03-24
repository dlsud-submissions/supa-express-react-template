import * as searchQueries from '../db/queries/search/search.queries.js';
import { ValidationError } from '../errors/AppError.js';
import { InternalServerError } from '../errors/ServerError.js';

// Whitelist of valid sections — add new data types here as they're built
const sectionMap = {
  users: (params) => searchQueries.searchUsers(params),
};

/**
 * Handles search requests across all data sections.
 * - Routes to the correct query function based on the section param.
 * - Passes validated filter and sort params to the query layer.
 * @param {Object} req - Express request.
 * @param {Object} res - Express response.
 * @param {Function} next - Express next middleware.
 */
export const searchGet = async (req, res, next) => {
  try {
    const {
      section = 'users',
      q = '',
      sortBy,
      sortDir,
      ...filters
    } = req.query;

    if (!sectionMap[section]) {
      return next(new ValidationError(`Invalid section: '${section}'`));
    }

    const results = await sectionMap[section]({
      q,
      sortBy,
      sortDir,
      ...filters,
    });

    res.status(200).json({ section, results });
  } catch (error) {
    next(new InternalServerError('Search query failed'));
  }
};
