import { vi, describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import adminRouter from '../../routes/admin.routes.js';
import * as adminQueries from '../../db/queries/admin/admin.queries.js';

// Mock the query layer to avoid actual DB side effects
vi.mock('../../db/queries/admin/admin.queries.js', () => ({
  getAllUsersForManagement: vi.fn(),
  promoteUserToAdmin: vi.fn(),
  demoteAdminToUser: vi.fn(),
}));

// Mock auth middleware to simulate an admin session
vi.mock('../../middleware/auth/auth.middleware.js', () => ({
  isAuthenticated: vi.fn((req, res, next) => next()),
  isAdmin: vi.fn((req, res, next) => {
    // Populate request with simulated super admin privileges
    req.user = { id: 1, username: 'admin', role: 'SUPER_ADMIN' };
    next();
  }),
}));

/**
 * Integration tests for Administrative API endpoints.
 * - Validates JSON response structures for user management.
 * - Verifies custom error class propagation (404, 500, etc.).
 * - Ensures correct interaction between controllers and query mocks for role changes.
 */
describe('Admin Integration Tests', () => {
  let app;

  beforeEach(() => {
    // Initialize express app for testing
    app = express();
    app.use(express.json());

    // Mount the admin router
    app.use('/admin', adminRouter);

    // Global error handler mock to catch custom Error classes
    app.use((err, req, res, next) => {
      res.status(err.statusCode || 500).json({
        message: err.message,
        status: err.status,
      });
    });
  });

  describe('GET /admin/users', () => {
    it('should fetch users and return a JSON list', async () => {
      // --- Arrange ---
      const mockUsers = [
        { id: 1, username: 'test1', role: 'USER' },
        { id: 2, username: 'test2', role: 'ADMIN' },
      ];
      adminQueries.getAllUsersForManagement.mockResolvedValue(mockUsers);

      // --- Act ---
      const response = await request(app).get('/admin/users');

      // --- Assert ---
      expect(response.status).toBe(200);
      expect(response.body.users).toEqual(mockUsers);
      expect(adminQueries.getAllUsersForManagement).toHaveBeenCalled();
    });

    it('should return 500 when database retrieval fails', async () => {
      // --- Arrange ---
      adminQueries.getAllUsersForManagement.mockRejectedValue(
        new Error('Connection failure')
      );

      // --- Act ---
      const response = await request(app).get('/admin/users');

      // --- Assert ---
      expect(response.status).toBe(500);
      expect(response.body.message).toMatch(/failed to retrieve/i);
    });
  });

  describe('POST /admin/users/:id/promote', () => {
    it('should return 200 and updated user on successful promotion', async () => {
      // --- Arrange ---
      const targetUserId = 5;
      const updatedUser = { id: targetUserId, role: 'ADMIN' };
      adminQueries.promoteUserToAdmin.mockResolvedValue(updatedUser);

      // --- Act ---
      const response = await request(app).post(
        `/admin/users/${targetUserId}/promote`
      );

      // --- Assert ---
      expect(response.status).toBe(200);
      expect(response.body.message).toMatch(/promoted successfully/i);
      expect(response.body.user).toEqual(updatedUser);
      expect(adminQueries.promoteUserToAdmin).toHaveBeenCalledWith(
        targetUserId
      );
    });

    it('should return 404 error if user does not exist', async () => {
      // --- Arrange ---
      adminQueries.promoteUserToAdmin.mockResolvedValue(null);

      // --- Act ---
      const response = await request(app).post('/admin/users/999/promote');

      // --- Assert ---
      expect(response.status).toBe(404);
      expect(response.body.message).toMatch(/not found/i);
    });

    it('should return 400 error if ID is not a number', async () => {
      // --- Arrange ---
      // --- Act ---
      const response = await request(app).post('/admin/users/abc/promote');

      // --- Assert ---
      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/invalid user id/i);
    });
  });

  describe('POST /admin/users/:id/demote', () => {
    it('should return 200 and updated user on successful demotion', async () => {
      // --- Arrange ---
      const targetUserId = 10;
      const updatedUser = { id: targetUserId, role: 'USER' };
      adminQueries.demoteAdminToUser.mockResolvedValue(updatedUser);

      // --- Act ---
      const response = await request(app).post(
        `/admin/users/${targetUserId}/demote`
      );

      // --- Assert ---
      expect(response.status).toBe(200);
      expect(response.body.message).toMatch(/demoted successfully/i);
      expect(response.body.user).toEqual(updatedUser);
      expect(adminQueries.demoteAdminToUser).toHaveBeenCalledWith(targetUserId);
    });

    it('should return 404 if user to demote is not found', async () => {
      // --- Arrange ---
      adminQueries.demoteAdminToUser.mockResolvedValue(null);

      // --- Act ---
      const response = await request(app).post('/admin/users/999/demote');

      // --- Assert ---
      expect(response.status).toBe(404);
      expect(response.body.message).toMatch(/not found/i);
    });

    it('should return 500 error if demote operation crashes', async () => {
      // --- Arrange ---
      adminQueries.demoteAdminToUser.mockRejectedValue(
        new Error('Database Failure')
      );

      // --- Act ---
      const response = await request(app).post('/admin/users/1/demote');

      // --- Assert ---
      expect(response.status).toBe(500);
      expect(response.body.message).toMatch(/error occurred while demoting/i);
    });
  });
});
