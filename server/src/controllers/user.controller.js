import * as userQueries from '../db/queries/user/user.queries.js';
import { InternalServerError } from '../errors/ServerError.js';
import { AuthenticationError, NotFoundError } from '../errors/AppError.js';

/**
 * Provides account details for the current user.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware.
 */
export const profileGet = async (req, res, next) => {
  try {
    // Authenticate session
    if (!req.user)
      return next(new AuthenticationError('User session not found'));

    // Fetch fresh data from database
    const user = await userQueries.getUserById(req.user.id);
    if (!user) return next(new NotFoundError('User profile not found'));

    // Send standardized profile response
    res.status(200).json({
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
      },
    });
  } catch (err) {
    // Handle database or unexpected errors
    next(new InternalServerError(err.message));
  }
};

/**
 * Fetches a specific user by ID for administrative views.
 * @param {Object} req - Express request.
 * @param {Object} res - Express response.
 * @param {Function} next - Next middleware.
 */
export const getUserById = async (req, res, next) => {
  try {
    // Extract and parse ID
    const { id } = req.params;
    const targetId = parseInt(id, 10);

    if (isNaN(targetId))
      return next(new NotFoundError('Invalid User ID format'));

    // Fetch targeted user
    const user = await userQueries.getUserById(targetId);
    if (!user) return next(new NotFoundError(`User with ID ${id} not found`));

    // Send standardized user data
    res.status(200).json({
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
      },
    });
  } catch (err) {
    // Catch-all for server errors
    next(new InternalServerError(err.message));
  }
};
