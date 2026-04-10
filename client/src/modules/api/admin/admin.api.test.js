import { beforeEach, describe, expect, it, vi } from 'vitest';
import { supabase } from '../../../lib/supabase.js';
import { adminApi } from './admin.api';

vi.mock('../../../lib/supabase.js', () => {
  const chain = {
    select: vi.fn(),
    update: vi.fn(),
    eq: vi.fn(),
    order: vi.fn(),
    single: vi.fn(),
  };
  chain.select.mockReturnValue(chain);
  chain.update.mockReturnValue(chain);
  chain.eq.mockReturnValue(chain);
  chain.order.mockReturnValue(chain);

  return {
    supabase: {
      from: vi.fn(() => chain),
      _chain: chain,
    },
  };
});

describe('adminApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const chain = supabase._chain;
    chain.select.mockReturnValue(chain);
    chain.update.mockReturnValue(chain);
    chain.eq.mockReturnValue(chain);
    chain.order.mockReturnValue(chain);
    supabase.from.mockReturnValue(chain);
  });

  describe('getAllUsers()', () => {
    it('queries public.users ordered by created_at ascending', async () => {
      supabase._chain.order.mockResolvedValue({
        data: [{ id: 'uuid-1', username: 'alice', role: 'USER' }],
        error: null,
      });

      await adminApi.getAllUsers();

      expect(supabase.from).toHaveBeenCalledWith('users');
      expect(supabase._chain.order).toHaveBeenCalledWith('created_at', {
        ascending: true,
      });
    });
  });

  describe('promoteUser()', () => {
    it('updates role to ADMIN for the given user id', async () => {
      supabase._chain.single.mockResolvedValue({
        data: { id: 'uuid-1', role: 'ADMIN' },
        error: null,
      });

      await adminApi.promoteUser('uuid-1');

      expect(supabase.from).toHaveBeenCalledWith('users');
      expect(supabase._chain.update).toHaveBeenCalledWith({ role: 'ADMIN' });
      expect(supabase._chain.eq).toHaveBeenCalledWith('id', 'uuid-1');
    });
  });

  describe('demoteUser()', () => {
    it('updates role to USER for the given user id', async () => {
      supabase._chain.single.mockResolvedValue({
        data: { id: 'uuid-1', role: 'USER' },
        error: null,
      });

      await adminApi.demoteUser('uuid-1');

      expect(supabase.from).toHaveBeenCalledWith('users');
      expect(supabase._chain.update).toHaveBeenCalledWith({ role: 'USER' });
      expect(supabase._chain.eq).toHaveBeenCalledWith('id', 'uuid-1');
    });
  });
});
