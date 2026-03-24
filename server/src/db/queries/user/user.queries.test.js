import { vi, describe, it, expect } from 'vitest';
import * as userQueries from './user.queries.js';
import { prisma } from '../../../lib/prisma.js';

// Isolate DB logic by mocking the Prisma client
vi.mock('../../../lib/prisma.js', () => ({
  prisma: { user: mockPrismaUser() },
}));

describe('userQueries module', () => {
  describe('getUserById()', () => {
    it('should retrieve a user matching the provided ID', async () => {
      // --- Arrange ---
      const id = 1;
      const mockUser = { id, username: 'testuser' };
      prisma.user.findUnique.mockResolvedValue(mockUser);

      // --- Act ---
      const result = await userQueries.getUserById(id);

      // --- Assert ---
      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id } });
      expect(result).toEqual(mockUser);
    });
  });

  describe('getUserByUsername()', () => {
    it('should retrieve a user matching the provided username', async () => {
      // --- Arrange ---
      const username = 'testuser';
      const mockUser = { id: 1, username };
      prisma.user.findUnique.mockResolvedValue(mockUser);

      // --- Act ---
      const result = await userQueries.getUserByUsername(username);

      // --- Assert ---
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { username },
      });
      expect(result).toEqual(mockUser);
    });
  });

  describe('createUser()', () => {
    it('should persist a new user record with provided data', async () => {
      // --- Arrange ---
      const userData = { username: 'newguy', password: 'hashed_password' };
      const mockCreated = { id: 2, ...userData };
      prisma.user.create.mockResolvedValue(mockCreated);

      // --- Act ---
      const result = await userQueries.createUser(userData);

      // --- Assert ---
      expect(prisma.user.create).toHaveBeenCalledWith({ data: userData });
      expect(result).toEqual(mockCreated);
    });
  });

  describe('getAllUsers()', () => {
    it('should fetch all users sorted by ID in ascending order', async () => {
      // --- Arrange ---
      const mockList = [
        { id: 1, username: 'a' },
        { id: 2, username: 'b' },
      ];
      prisma.user.findMany.mockResolvedValue(mockList);

      // --- Act ---
      const result = await userQueries.getAllUsers();

      // --- Assert ---
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        orderBy: { id: 'asc' },
      });
      expect(result).toEqual(mockList);
    });
  });
});
