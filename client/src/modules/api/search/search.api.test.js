import { describe, it, expect, vi } from 'vitest';
import { searchApi } from './search.api';

describe('searchApi', () => {
  const mockSuccessResponse = () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ section: 'users', results: [] }),
    });
  };

  it('calls the correct endpoint with GET', async () => {
    // --- Arrange ---
    mockSuccessResponse();

    // --- Act ---
    await searchApi.search({ section: 'users' });

    // --- Assert ---
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/search'),
      expect.objectContaining({ method: 'GET', credentials: 'include' })
    );
  });

  it('serializes q into the query string', async () => {
    // --- Arrange ---
    mockSuccessResponse();

    // --- Act ---
    await searchApi.search({ section: 'users', q: 'alice' });

    // --- Assert ---
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('q=alice'),
      expect.any(Object)
    );
  });

  it('serializes sortBy and sortDir into the query string', async () => {
    // --- Arrange ---
    mockSuccessResponse();

    // --- Act ---
    await searchApi.search({
      section: 'users',
      sortBy: 'createdAt',
      sortDir: 'asc',
    });

    // --- Assert ---
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('sortBy=createdAt'),
      expect.any(Object)
    );
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('sortDir=asc'),
      expect.any(Object)
    );
  });

  it('serializes additional filters into the query string', async () => {
    // --- Arrange ---
    mockSuccessResponse();

    // --- Act ---
    await searchApi.search({ section: 'users', role: 'ADMIN' });

    // --- Assert ---
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('role=ADMIN'),
      expect.any(Object)
    );
  });

  it('omits undefined sortBy and sortDir from the query string', async () => {
    // --- Arrange ---
    mockSuccessResponse();

    // --- Act ---
    await searchApi.search({ section: 'users' });

    // --- Assert ---
    expect(fetch).toHaveBeenCalledWith(
      expect.not.stringContaining('sortBy'),
      expect.any(Object)
    );
  });
});
