import { beforeEach, describe, expect, it, vi } from 'vitest';
import { supabase } from '../../../lib/supabase.js';
import { userApi } from './user.api';

vi.mock('../../../lib/supabase.js', () => {
  const selectChain = {
    select: vi.fn(),
    eq: vi.fn(),
    single: vi.fn(),
  };
  // Make each method return the chain so calls can be chained
  selectChain.select.mockReturnValue(selectChain);
  selectChain.eq.mockReturnValue(selectChain);

  return {
    supabase: {
      auth: {
        getSession: vi.fn(),
      },
      from: vi.fn(() => selectChain),
      _chain: selectChain,
    },
  };
});

describe('userApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Re-wire chain after clearAllMocks
    const chain = supabase._chain;
    chain.select.mockReturnValue(chain);
    chain.eq.mockReturnValue(chain);
    supabase.from.mockReturnValue(chain);
  });

  describe('getProfile()', () => {
    it('returns error when there is no active session', async () => {
      supabase.auth.getSession.mockResolvedValue({ data: { session: null } });

      const result = await userApi.getProfile();

      expect(result.data).toBeNull();
      expect(result.error.message).toMatch(/no active session/i);
    });

    it('queries public.users with the session user id', async () => {
      const mockSession = { user: { id: 'user-uuid-123' } };
      supabase.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
      });
      supabase._chain.single.mockResolvedValue({
        data: { id: 'user-uuid-123', username: 'alice', role: 'USER' },
        error: null,
      });

      await userApi.getProfile();

      expect(supabase.from).toHaveBeenCalledWith('users');
      expect(supabase._chain.eq).toHaveBeenCalledWith('id', 'user-uuid-123');
    });
  });

  describe('getById()', () => {
    it('queries public.users with the provided user id', async () => {
      supabase._chain.single.mockResolvedValue({
        data: { id: 'target-uuid', username: 'bob', role: 'ADMIN' },
        error: null,
      });

      await userApi.getById('target-uuid');

      expect(supabase.from).toHaveBeenCalledWith('users');
      expect(supabase._chain.eq).toHaveBeenCalledWith('id', 'target-uuid');
    });

    it('returns error shape when user is not found', async () => {
      supabase._chain.single.mockResolvedValue({
        data: null,
        error: { message: 'No rows found' },
      });

      const result = await userApi.getById('nonexistent-uuid');

      expect(result.data).toBeNull();
      expect(result.error).toBeTruthy();
    });
  });
});
