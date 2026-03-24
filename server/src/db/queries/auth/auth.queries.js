import { prisma } from '../../../lib/prisma.js';

/**
 * Creates a new user record with an assigned Role.
 * - Maps optional admin flag to Role enum.
 * - Defaults to 'USER' if no role/admin status provided.
 * @param {Object} userData - Registration details.
 * @returns {Promise<Object>} The created user record.
 */
export const registerUser = async (userData) => {
  // Determine role based on admin flag or explicit role property
  const role = userData.role || (userData.admin ? 'ADMIN' : 'USER');

  // Persist user with specific field mapping
  return await prisma.user.create({
    data: {
      username: userData.username,
      password: userData.password,
      role: role,
    },
  });
};

/**
 * Updates the user's last login timestamp.
 * - Used during the authentication flow to track activity.
 * @param {number} userId - Primary key of the user.
 * @returns {Promise<Object>} The updated user record.
 */
export const updateLastLogin = async (userId) => {
  // Execute timestamp update
  return await prisma.user.update({
    where: { id: userId },
    data: { lastLogin: new Date() },
  });
};
