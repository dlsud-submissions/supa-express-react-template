import { describe, it, expect, vi } from 'vitest';
import { userApi } from './user.api';

describe('userApi', () => {
  it('getProfile requests the profile endpoint', async () => {
    // --- Arrange ---
    // Mock successful profile retrieval
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ profile: {} }),
    });

    // --- Act ---
    await userApi.getProfile();

    // --- Assert ---
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/user/profile'),
      expect.objectContaining({ method: 'GET' })
    );
  });

  it('getById appends the userId correctly', async () => {
    // --- Arrange ---
    // Prepare specific user target and response
    const userId = 99;
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: userId }),
    });

    // --- Act ---
    await userApi.getById(userId);

    // --- Assert ---
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining(`/api/user/profile/${userId}`),
      expect.any(Object)
    );
  });
});
