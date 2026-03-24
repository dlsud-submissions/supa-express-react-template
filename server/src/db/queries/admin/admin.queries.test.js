import { vi, describe, it, expect } from 'vitest';
import * as adminQueries from './admin.queries.js';
import { prisma } from '../../../lib/prisma.js';

vi.mock('../../../lib/prisma.js', () => ({
  prisma: { user: mockPrismaUser() },
}));

describe('adminQueries module', () => {
  describe('getAllUsersForManagement()', () => {
    it('should query specific user fields including role', async () => {
      // --- Arrange ---
      const mockUsers = [
        { id: 1, username: 'user1', role: 'USER', createdAt: new Date() },
      ];
      prisma.user.findMany.mockResolvedValue(mockUsers);

      // --- Act ---
      const result = await adminQueries.getAllUsersForManagement();

      // --- Assert ---
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        select: {
          id: true,
          username: true,
          role: true,
          createdAt: true,
        },
        orderBy: { id: 'asc' },
      });
      expect(result).toEqual(mockUsers);
    });
  });

  describe('promoteUserToAdmin()', () => {
    it('should update the role to ADMIN for a specific user id', async () => {
      // --- Arrange ---
      const userId = 42;
      const mockUpdatedUser = { id: 42, role: 'ADMIN' };
      prisma.user.update.mockResolvedValue(mockUpdatedUser);

      // --- Act ---
      const result = await adminQueries.promoteUserToAdmin(userId);

      // --- Assert ---
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { role: 'ADMIN' },
      });
      expect(result.role).toBe('ADMIN');
    });
  });
});
