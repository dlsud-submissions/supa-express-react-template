import { vi, describe, it, expect } from 'vitest';
import * as authQueries from './auth.queries.js';
import { prisma } from '../../../lib/prisma.js';

// Isolate DB logic by mocking Prisma client
vi.mock('../../../lib/prisma.js', () => ({
  prisma: { user: mockPrismaUser() },
}));

describe('authQueries module', () => {
  describe('registerUser()', () => {
    it('should create a user with default USER role', async () => {
      // --- Arrange ---
      const input = { username: 'testuser', password: 'hashed_password' };
      const mockUser = { id: 1, ...input, role: 'USER' };
      prisma.user.create.mockResolvedValue(mockUser);

      // --- Act ---
      const result = await authQueries.registerUser(input);

      // --- Assert ---
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          username: 'testuser',
          password: 'hashed_password',
          role: 'USER',
        },
      });
      expect(result.role).toBe('USER');
    });

    it('should map admin: true input to ADMIN role', async () => {
      // --- Arrange ---
      const input = { username: 'admin', password: 'pw', admin: true };
      prisma.user.create.mockResolvedValue({
        id: 2,
        username: 'admin',
        role: 'ADMIN',
      });

      // --- Act ---
      await authQueries.registerUser(input);

      // --- Assert ---
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ role: 'ADMIN' }),
      });
    });
  });

  describe('updateLastLogin()', () => {
    it('should update the lastLogin field', async () => {
      // --- Arrange ---
      const userId = 5;
      prisma.user.update.mockResolvedValue({
        id: userId,
        lastLogin: new Date(),
      });

      // --- Act ---
      await authQueries.updateLastLogin(userId);

      // --- Assert ---
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { lastLogin: expect.any(Date) },
      });
    });
  });
});
