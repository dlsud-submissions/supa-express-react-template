import { vi, describe, it, expect } from 'vitest';
import * as searchQueries from './search.queries.js';
import { prisma } from '../../../lib/prisma.js';

vi.mock('../../../lib/prisma.js', () => ({
  prisma: { user: mockPrismaUser() },
}));

describe('searchQueries module', () => {
  describe('searchUsers()', () => {
    it('should return all users when no params are provided', async () => {
      // --- Arrange ---
      const mockUsers = [{ id: 1, username: 'alice', role: 'USER' }];
      prisma.user.findMany.mockResolvedValue(mockUsers);

      // --- Act ---
      const result = await searchQueries.searchUsers();

      // --- Assert ---
      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy: { createdAt: 'desc' } })
      );
      expect(result).toEqual(mockUsers);
    });

    it('should filter by username when q is provided', async () => {
      // --- Arrange ---
      prisma.user.findMany.mockResolvedValue([]);

      // --- Act ---
      await searchQueries.searchUsers({ q: 'alice' });

      // --- Assert ---
      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            username: { contains: 'alice', mode: 'insensitive' },
          }),
        })
      );
    });

    it('should filter by role when role is provided', async () => {
      // --- Arrange ---
      prisma.user.findMany.mockResolvedValue([]);

      // --- Act ---
      await searchQueries.searchUsers({ role: 'ADMIN' });

      // --- Assert ---
      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ role: 'ADMIN' }),
        })
      );
    });

    it('should apply joinedAfter as start-of-day UTC gte filter', async () => {
      // --- Arrange ---
      prisma.user.findMany.mockResolvedValue([]);

      // --- Act ---
      await searchQueries.searchUsers({ joinedAfter: '2024-01-01' });

      // --- Assert ---
      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            createdAt: expect.objectContaining({
              gte: new Date('2024-01-01T00:00:00.000Z'),
            }),
          }),
        })
      );
    });

    it('should apply joinedBefore as end-of-day UTC lte filter', async () => {
      // --- Arrange ---
      prisma.user.findMany.mockResolvedValue([]);

      // --- Act ---
      await searchQueries.searchUsers({ joinedBefore: '2024-01-31' });

      // --- Assert ---
      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            createdAt: expect.objectContaining({
              lte: new Date('2024-01-31T23:59:59.999Z'),
            }),
          }),
        })
      );
    });

    it('should combine joinedAfter and joinedBefore into a date range', async () => {
      // --- Arrange ---
      prisma.user.findMany.mockResolvedValue([]);

      // --- Act ---
      await searchQueries.searchUsers({
        joinedAfter: '2024-01-01',
        joinedBefore: '2024-12-31',
      });

      // --- Assert ---
      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            createdAt: {
              gte: new Date('2024-01-01T00:00:00.000Z'),
              lte: new Date('2024-12-31T23:59:59.999Z'),
            },
          }),
        })
      );
    });

    it('should apply sortBy and sortDir when provided', async () => {
      // --- Arrange ---
      prisma.user.findMany.mockResolvedValue([]);

      // --- Act ---
      await searchQueries.searchUsers({ sortBy: 'username', sortDir: 'asc' });

      // --- Assert ---
      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy: { username: 'asc' } })
      );
    });

    it('should fall back to createdAt desc for invalid sortBy values', async () => {
      // --- Arrange ---
      prisma.user.findMany.mockResolvedValue([]);

      // --- Act ---
      await searchQueries.searchUsers({ sortBy: 'password' });

      // --- Assert ---
      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy: { createdAt: 'desc' } })
      );
    });
  });
});
