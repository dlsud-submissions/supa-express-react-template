import { describe, it, expect, vi } from 'vitest';
import { setAuthCookie, clearAuthCookie } from './cookie.js';
// Import from the actual config source
import { cookieOptions } from '../../../config/cookieOptions.js';

describe('Auth Cookie Utility', () => {
  // Generate mock response
  const mockResponse = () => {
    const res = {};
    res.cookie = vi.fn().mockReturnValue(res);
    res.clearCookie = vi.fn().mockReturnValue(res);
    return res;
  };

  it('setAuthCookie() should call res.cookie with correct parameters', () => {
    // Arrange
    const res = mockResponse();
    const testToken = 'mock-jwt-token';

    // Act
    setAuthCookie(res, testToken);

    // Assert
    expect(res.cookie).toHaveBeenCalledWith('token', testToken, cookieOptions);
  });

  it('clearAuthCookie() should call res.clearCookie with matching options', () => {
    // Arrange
    const res = mockResponse();

    // Act
    clearAuthCookie(res);

    // Assert
    // Verify security options spread correctly with expired maxAge
    expect(res.clearCookie).toHaveBeenCalledWith('token', {
      ...cookieOptions,
      maxAge: 0,
    });
  });
});
