import { vi, describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import userRouter from '../../routes/user.routes.js';

// Mock auth middleware to simulate authenticated JSON sessions
vi.mock('../../middleware/auth/auth.middleware.js', () => ({
  isAuthenticated: vi.fn((req, res, next) => {
    // Inject mock user into request object
    req.user = { id: 10, username: 'standard_user', role: 'USER' };
    next();
  }),
  isNotAdmin: vi.fn((req, res, next) => next()),
}));

// Mock user query layer to prevent real DB calls in profile fetch
vi.mock('../../db/queries/user/user.queries.js', () => ({
  getUserById: vi.fn(),
}));

import * as userQueries from '../../db/queries/user/user.queries.js';

/**
 * Integration tests for the User API module.
 * - Validates JSON profile data delivery.
 * - Ensures correct status codes and error propagation.
 */
describe('User Integration Tests', () => {
  let app;

  beforeEach(() => {
    // Initialize express app for JSON API testing
    app = express();
    app.use(express.json());

    // Mount user router
    app.use('/user', userRouter);

    // Mock global error handler to capture custom Error classes
    app.use((err, req, res, next) => {
      res.status(err.statusCode || 500).json({
        message: err.message,
        status: err.status,
      });
    });
  });

  describe('GET /user/profile', () => {
    it('should return 200 and the sanitized user profile JSON', async () => {
      // --- Arrange ---
      userQueries.getUserById.mockResolvedValueOnce({
        id: 10,
        username: 'standard_user',
        role: 'USER',
        createdAt: null,
        lastLogin: null,
      });

      // --- Act ---
      const response = await request(app).get('/user/profile');

      // --- Assert ---
      expect(response.status).toBe(200);
      expect(response.body.user.username).toBe('standard_user');
      expect(response.body.user.id).toBe(10);
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should return 401 if the user is not attached to the request', async () => {
      // --- Arrange ---
      const { isAuthenticated } =
        await import('../../middleware/auth/auth.middleware.js');
      // Simulate a failure where middleware fails to populate req.user
      isAuthenticated.mockImplementationOnce((req, res, next) => {
        req.user = null;
        next();
      });

      // --- Act ---
      const response = await request(app).get('/user/profile');

      // --- Assert ---
      expect(response.status).toBe(401);
      expect(response.body.message).toMatch(/User session not found/i);
    });
  });
});
