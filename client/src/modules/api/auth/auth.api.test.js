import { describe, it, expect, vi } from 'vitest';
import { authApi } from './auth.api';

describe('authApi', () => {
  it('login sends a POST request with credentials included', async () => {
    // --- Arrange ---
    // Prepare test credentials and mock response
    const credentials = { username: 'test', password: 'password' };
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ message: 'Success' }),
    });

    // --- Act ---
    // Execute the login API call
    await authApi.login(credentials);

    // --- Assert ---
    // Verify fetch was called with correct endpoint and payload
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/auth/log-in'),
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify(credentials),
      })
    );
  });
});