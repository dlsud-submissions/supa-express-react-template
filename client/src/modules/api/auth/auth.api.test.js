import { beforeEach, describe, expect, it, vi } from 'vitest';
import { supabase } from '../../../lib/supabase.js';
import { authApi } from './auth.api';

// Mock the Supabase client to prevent actual network calls
vi.mock('../../../lib/supabase.js', () => ({
  supabase: {
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn(),
    },
  },
}));

describe('authApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  describe('signup', () => {
    it('calls signUp with the provided email', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'securePassword',
      };

      await authApi.signup(userData);

      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'securePassword',
      });
    });
  });

  describe('login', () => {
    it('calls signInWithPassword with the provided email', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'securePassword',
      };

      await authApi.login(credentials);

      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'securePassword',
      });
    });
  });

  describe('logout', () => {
    it('calls signOut to clear the local session', async () => {
      await authApi.logout();
      expect(supabase.auth.signOut).toHaveBeenCalled();
    });
  });

  describe('sendOtp', () => {
    it('posts OTP send payload to the server API', async () => {
      const mockedResponse = { success: true };
      global.fetch.mockResolvedValueOnce({
        json: vi.fn().mockResolvedValueOnce(mockedResponse),
      });

      const response = await authApi.sendOtp(
        '11111111-1111-1111-1111-111111111111',
        'test@example.com',
        'email_verification'
      );

      expect(global.fetch).toHaveBeenCalledWith('/api/otp/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: '11111111-1111-1111-1111-111111111111',
          email: 'test@example.com',
          purpose: 'email_verification',
        }),
      });
      expect(response).toEqual(mockedResponse);
    });
  });

  describe('verifyOtp', () => {
    it('posts OTP verification payload to the server API', async () => {
      const mockedResponse = { valid: true };
      global.fetch.mockResolvedValueOnce({
        json: vi.fn().mockResolvedValueOnce(mockedResponse),
      });

      const response = await authApi.verifyOtp(
        '11111111-1111-1111-1111-111111111111',
        '123456',
        'email_verification'
      );

      expect(global.fetch).toHaveBeenCalledWith('/api/otp/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: '11111111-1111-1111-1111-111111111111',
          token: '123456',
          purpose: 'email_verification',
        }),
      });
      expect(response).toEqual(mockedResponse);
    });
  });

  describe('checkStatus', () => {
    it('calls getSession to retrieve existing session data', async () => {
      await authApi.checkStatus();
      expect(supabase.auth.getSession).toHaveBeenCalled();
    });
  });
});
