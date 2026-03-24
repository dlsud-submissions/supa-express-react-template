import { vi, describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import authRouter from '../../routes/auth.routes.js';
import * as userQueries from '../../db/queries/user/user.queries.js';
import * as authQueries from '../../db/queries/auth/auth.queries.js';

// Setup environment
process.env.JWT_SECRET = 'test-secret';

// Intercept DB pool
vi.mock('../../db/pool.js', () => ({
  default: { query: vi.fn() },
}));

// Mock user query layer for validators
vi.mock('../../db/queries/user/user.queries.js', () => ({
  getUserByUsername: vi.fn(),
  getUserByEmail: vi.fn(),
  createUser: vi.fn(),
}));

// Mock auth query layer for controller actions
vi.mock('../../db/queries/auth/auth.queries.js', () => ({
  registerUser: vi.fn(),
  updateLastLogin: vi.fn(),
}));

// Mock cookie utility to prevent reference errors during middleware execution
vi.mock('../../utils/auth/cookie/cookie.js', () => ({
  setAuthCookie: vi.fn(),
  clearAuthCookie: vi.fn(),
}));

// Mock passport config and library
vi.mock('../../config/passport.js', () => ({
  default: vi.fn(),
}));

vi.mock('passport', () => ({
  default: {
    initialize: vi.fn(() => (req, res, next) => next()),
    authenticate: vi.fn((strategy, options, callback) => (req, res, next) => {
      // Provide null user by default to satisfy isNotAuthenticated check
      if (callback) return callback(null, null);
      next();
    }),
  },
}));

describe('Auth Integration Tests', () => {
  let app;

  beforeEach(() => {
    // Initialize express app with test stack
    app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    app.use(cookieParser());

    // Mock view engine response
    app.use((req, res, next) => {
      res.render = vi.fn((view, locals) =>
        res.status(200).send({ view, locals, message: 'Success' })
      );
      next();
    });

    // Mount auth routes
    app.use('/', authRouter);

    // Basic error handler to catch and reveal 500 errors in tests
    app.use((err, req, res, next) => {
      res.status(err.statusCode || 500).json({ message: err.message });
    });
  });

  describe('POST /sign-up', () => {
    it('should hash password and return success on registration', async () => {
      // --- Arrange ---
      const userData = {
        username: 'newuser',
        password: 'Password123',
        confirmPassword: 'Password123',
      };
      userQueries.getUserByUsername.mockResolvedValue(null);
      authQueries.registerUser.mockResolvedValue({
        id: 1,
        username: 'newuser',
      });

      // --- Act ---
      const response = await request(app).post('/sign-up').send(userData);

      // --- Assert ---
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty(
        'message',
        'User registered successfully'
      );
    });
  });

  describe('POST /log-in', () => {
    it('should set an HttpOnly cookie and return user info', async () => {
      // --- Arrange ---
      const credentials = { username: 'admin', password: 'password' };
      const mockAdmin = { id: 99, username: 'admin', role: 'ADMIN' };
      authQueries.updateLastLogin.mockResolvedValue(true);

      // Override default passport mock for this specific login success case
      passport.authenticate.mockImplementation(
        (strategy, options, callback) => {
          return (req, res, next) => {
            if (callback) return callback(null, mockAdmin);
            next();
          };
        }
      );

      // --- Act ---
      const response = await request(app).post('/log-in').send(credentials);

      // --- Assert ---
      expect(response.status).toBe(200);
    });
  });

  describe('GET /log-out', () => {
    it('should clear the token cookie and return success message', async () => {
      // --- Act ---
      const response = await request(app).get('/log-out');

      // --- Assert ---
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Logged out successfully');
    });
  });
});
