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
  });

  describe('signup', () => {
    it('calls signUp with real email and username metadata', async () => {
      const userData = {
        email: 'newuser@example.com',
        password: 'securePassword',
        username: 'testuser',
      };

      await authApi.signup(userData);

      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'newuser@example.com',
        password: 'securePassword',
        options: {
          data: { username: 'testuser' },
        },
      });
    });
  });

  describe('login', () => {
    it('calls signInWithPassword with derived app.local email', async () => {
      const credentials = { username: 'testuser', password: 'securePassword' };

      await authApi.login(credentials);

      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'testuser@app.local',
        password: 'securePassword',
      });
    });
  });

  describe('loginWithEmail', () => {
    it('calls signInWithPassword with the provided email directly', async () => {
      await authApi.loginWithEmail({
        email: 'user@example.com',
        password: 'securePassword',
      });

      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'user@example.com',
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

  describe('checkStatus', () => {
    it('calls getSession to retrieve existing session data', async () => {
      await authApi.checkStatus();
      expect(supabase.auth.getSession).toHaveBeenCalled();
    });
  });
});
