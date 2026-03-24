import * as adminQueries from '../db/queries/admin/admin.queries.js';
import { InternalServerError } from '../errors/ServerError.js';
import { NotFoundError, ValidationError } from '../errors/AppError.js';

/**
 * Fetches all users for administrative management.
 * - Returns users as a JSON array.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
export const usersGet = async (req, res, next) => {
  try {
    // Attempt to retrieve user management list from DB
    const users = await adminQueries.getAllUsersForManagement();

    // Return JSON payload for frontend state management
    res.status(200).json({ users });
  } catch (error) {
    // Wrap unexpected DB failures in InternalServerError (500)
    next(
      new InternalServerError('Failed to retrieve user list for management')
    );
  }
};

/**
 * Promotes a specific user to administrator status.
 * - Updates user role and returns the updated user object.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
export const promotePost = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id);

    if (isNaN(userId)) {
      return next(new ValidationError('Invalid user ID format'));
    }

    // Perform the update in the database */
    const updatedUser = await adminQueries.promoteUserToAdmin(userId);

    // If the query returns nothing, the ID was likely invalid */
    if (!updatedUser) {
      return next(new NotFoundError(`User with ID ${userId}`));
    }

    // Return success status and updated data instead of redirecting */
    res.status(200).json({
      message: 'User promoted successfully',
      user: updatedUser,
    });
  } catch (error) {
    next(new InternalServerError('An error occurred while promoting the user'));
  }
};

/**
 * Demotes an administrator back to standard user status.
 * - Validates ID format before database update.
 * - Handles 404 scenarios if the user record does not exist.
 * @param {Object} req - Express request.
 * @param {Object} res - Express response.
 * @param {Function} next - Express next middleware.
 */
export const demotePost = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id);

    if (isNaN(userId)) {
      return next(new ValidationError('Invalid user ID format'));
    }

    // Execute the demotion query via Prisma
    const updatedUser = await adminQueries.demoteAdminToUser(userId);

    if (!updatedUser) {
      return next(new NotFoundError(`User with ID ${userId}`));
    }

    // Respond with success confirmation and updated data
    res.status(200).json({
      message: 'User demoted successfully',
      user: updatedUser,
    });
  } catch (error) {
    next(new InternalServerError('An error occurred while demoting the user'));
  }
};
