import { vi, describe, it, expect, beforeEach } from 'vitest';
import passport from 'passport';
import * as authMiddleware from './auth.middleware.js';
import { clearAuthCookie } from '../../utils/auth/cookie/cookie.js';

// Mock passport to control authentication outcomes
vi.mock('passport', () => ({
  default: {
    authenticate: vi.fn(),
  },
}));

// Mock cookie utility to verify clearing calls
vi.mock('../../utils/auth/cookie/cookie.js', () => ({
  clearAuthCookie: vi.fn(),
}));

describe('authMiddleware module', () => {
  let req, res, next;

  beforeEach(() => {
    ({ req, res, next } = mockExpressContext());
  });

  describe('isAuthenticated()', () => {
    it('should attach user to req and call next if authenticated', () => {
      // --- Arrange ---
      const mockUser = { id: 1, username: 'test' };
      passport.authenticate.mockImplementation(
        (strategy, options, callback) => {
          return (req, res) => callback(null, mockUser);
        }
      );

      // --- Act ---
      authMiddleware.isAuthenticated(req, res, next);

      // --- Assert ---
      expect(req.user).toEqual(mockUser);
      expect(next).toHaveBeenCalled();
    });

    it('should return 401 and clear cookie if no user is found', () => {
      // --- Arrange ---
      passport.authenticate.mockImplementation(
        (strategy, options, callback) => {
          return (req, res) => callback(null, false);
        }
      );

      // --- Act ---
      authMiddleware.isAuthenticated(req, res, next);

      // --- Assert ---
      expect(clearAuthCookie).toHaveBeenCalledWith(res);
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          message: 'Please log in first',
        })
      );
    });
  });

  describe('isAdmin()', () => {
    it('should allow access if user is admin', () => {
      // --- Arrange ---
      const adminUser = { id: 1, role: 'ADMIN' };
      passport.authenticate.mockImplementation(
        (strategy, options, callback) => {
          return (req, res) => callback(null, adminUser);
        }
      );

      // --- Act ---
      authMiddleware.isAdmin(req, res, next);

      // --- Assert ---
      expect(next).toHaveBeenCalled();
    });

    it('should return 403 if user is not admin', () => {
      // --- Arrange ---
      const regularUser = { id: 2, role: 'USER' };
      passport.authenticate.mockImplementation(
        (strategy, options, callback) => {
          return (req, res) => callback(null, regularUser);
        }
      );

      // --- Act ---
      authMiddleware.isAdmin(req, res, next);

      // --- Assert ---
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 403 })
      );
    });
  });

  describe('isNotAuthenticated()', () => {
    it('should clear cookie and call next if user is already logged in', () => {
      // --- Arrange ---
      const existingUser = { id: 1 };
      passport.authenticate.mockImplementation(
        (strategy, options, callback) => {
          return (req, res) => callback(null, existingUser);
        }
      );

      // --- Act ---
      authMiddleware.isNotAuthenticated(req, res, next);

      // --- Assert ---
      expect(clearAuthCookie).toHaveBeenCalledWith(res);
      expect(next).toHaveBeenCalled();
    });
  });
});
