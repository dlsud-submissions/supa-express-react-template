import { vi, describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import searchRouter from '../../routes/search.routes.js';
import * as searchQueries from '../../db/queries/search/search.queries.js';

vi.mock('../../db/queries/search/search.queries.js', () => ({
  searchUsers: vi.fn(),
}));

vi.mock('../../middleware/auth/auth.middleware.js', () => ({
  isAuthenticated: vi.fn((req, res, next) => {
    req.user = { id: 1, username: 'admin', role: 'ADMIN' };
    next();
  }),
}));

describe('Search Integration Tests', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/search', searchRouter);
    app.use((err, req, res, next) => {
      res.status(err.statusCode || 500).json({ message: err.message });
    });
  });

  describe('GET /search', () => {
    it('should return 200 and user results for section=users', async () => {
      // --- Arrange ---
      const mockResults = [{ id: 1, username: 'alice', role: 'USER' }];
      searchQueries.searchUsers.mockResolvedValue(mockResults);

      // --- Act ---
      const response = await request(app).get('/search?section=users&q=alice');

      // --- Assert ---
      expect(response.status).toBe(200);
      expect(response.body.section).toBe('users');
      expect(response.body.results).toEqual(mockResults);
    });

    it('should return 200 with empty results when no matches found', async () => {
      // --- Arrange ---
      searchQueries.searchUsers.mockResolvedValue([]);

      // --- Act ---
      const response = await request(app).get('/search?section=users&q=zzz');

      // --- Assert ---
      expect(response.status).toBe(200);
      expect(response.body.results).toEqual([]);
    });

    it('should return 400 for an invalid section', async () => {
      // --- Act ---
      const response = await request(app).get('/search?section=posts');

      // --- Assert ---
      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/invalid section/i);
    });

    it('should return 500 when the query layer throws', async () => {
      // --- Arrange ---
      searchQueries.searchUsers.mockRejectedValue(new Error('DB failure'));

      // --- Act ---
      const response = await request(app).get('/search?section=users');

      // --- Assert ---
      expect(response.status).toBe(500);
    });
  });
});
