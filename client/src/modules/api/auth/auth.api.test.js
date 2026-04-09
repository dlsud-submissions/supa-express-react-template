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
    it('calls signUp with derived email and username metadata', async () => {
      const userData = { username: 'testuser', password: 'securePassword' };

      await authApi.signup(userData);

      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'testuser@app.local',
        password: 'securePassword',
        options: {
          data: { username: 'testuser' },
        },
      });
    });
  });

  describe('login', () => {
    it('calls signInWithPassword with derived email', async () => {
      const credentials = { username: 'testuser', password: 'securePassword' };

      await authApi.login(credentials);

      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'testuser@app.local',
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
