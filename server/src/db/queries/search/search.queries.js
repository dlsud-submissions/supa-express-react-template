import { prisma } from '../../../lib/prisma.js';

/**
 * Searches users by username with optional role, date, and sort filters.
 * @param {Object} params
 * @param {string} [params.q=''] - Partial username to search for.
 * @param {string} [params.role] - Optional role filter (USER, ADMIN, SUPER_ADMIN).
 * @param {string} [params.joinedAfter] - ISO date string — include users joined on or after this date.
 * @param {string} [params.joinedBefore] - ISO date string — include users joined on or before this date.
 * @param {string} [params.sortBy='createdAt'] - Field to sort by.
 * @param {string} [params.sortDir='desc'] - Sort direction ('asc' or 'desc').
 * @returns {Promise<Array>}
 */
export const searchUsers = async ({
  q = '',
  role,
  joinedAfter,
  joinedBefore,
  sortBy = 'createdAt',
  sortDir = 'desc',
} = {}) => {
  // Whitelist valid sort fields to prevent injection
  const validSortFields = ['username', 'createdAt', 'lastLogin', 'role'];
  const safeSortBy = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
  const safeSortDir = sortDir === 'asc' ? 'asc' : 'desc';

  // Build createdAt date range filter
  const createdAtFilter = {};
  if (joinedAfter) createdAtFilter.gte = new Date(joinedAfter + 'T00:00:00.000Z');
  if (joinedBefore) createdAtFilter.lte = new Date(joinedBefore + 'T23:59:59.999Z');
  const hasDateFilter = Object.keys(createdAtFilter).length > 0;

  return await prisma.user.findMany({
    where: {
      ...(q && { username: { contains: q, mode: 'insensitive' } }),
      ...(role && { role }),
      ...(hasDateFilter && { createdAt: createdAtFilter }),
    },
    select: {
      id: true,
      username: true,
      role: true,
      createdAt: true,
      lastLogin: true,
    },
    orderBy: { [safeSortBy]: safeSortDir },
  });
};