import { describe, it, expect, vi } from 'vitest';
import { adminApi } from './admin.api';

describe('adminApi', () => {
  // --- Arrange ---
  // Setup standard success response for fetch
  const mockSuccessResponse = (data = { success: true }) => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(data),
    });
  };

  it('getAllUsers calls the correct endpoint with GET', async () => {
    // --- Arrange ---
    mockSuccessResponse();

    // --- Act ---
    await adminApi.getAllUsers();

    // --- Assert ---
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/admin/users'),
      expect.objectContaining({
        method: 'GET',
        credentials: 'include',
      })
    );
  });

  it('promoteUser injects the userId into the URL', async () => {
    // --- Arrange ---
    const testId = 123;
    mockSuccessResponse();

    // --- Act ---
    await adminApi.promoteUser(testId);

    // --- Assert ---
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining(`/api/admin/users/${testId}/promote`),
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
      })
    );
  });

  it('demoteUser injects the userId into the URL', async () => {
    // --- Arrange ---
    const testId = 456;
    mockSuccessResponse();

    // --- Act ---
    await adminApi.demoteUser(testId);

    // --- Assert ---
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining(`/api/admin/users/${testId}/demote`),
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
      })
    );
  });
});
