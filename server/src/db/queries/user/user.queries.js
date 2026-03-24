import { prisma } from '../../../lib/prisma.js';

/**
 * Finds a unique user record by its primary ID.
 * @param {number} id - The unique identifier of the user.
 * @returns {Promise<Object|null>} The user object if found, otherwise null.
 */
export const getUserById = async (id) => {
  return await prisma.user.findUnique({ where: { id } });
};

/**
 * Finds a single user by their unique username.
 * @param {string} username - The username to search for.
 * @returns {Promise<Object|null>} The user object if found, otherwise null.
 */
export const getUserByUsername = async (username) => {
  return await prisma.user.findUnique({ where: { username } });
};

/**
 * Creates a new user in the database.
 * - Persists a new user record using the provided data object.
 * @param {Object} userData - Object containing account details.
 * @param {string} userData.username - The chosen username.
 * @param {string} userData.password - The hashed password.
 * @param {string} [userData.role] - Optional role assignment.
 * @returns {Promise<Object>} The newly created user record.
 */
export const createUser = async (userData) => {
  // Insert new user record into the database
  return await prisma.user.create({
    data: userData,
  });
};

/**
 * Retrieves all users from the database.
 * - Fetches the complete list of registered users.
 * - Results are sorted by ID in ascending order.
 * @returns {Promise<Array>} A list of all user objects.
 */
export const getAllUsers = async () => {
  // Fetch all records sorted by ID
  return await prisma.user.findMany({
    orderBy: { id: 'asc' },
  });
};
