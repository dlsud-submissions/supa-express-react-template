import { beforeEach, describe, expect, it, vi } from 'vitest';
import { supabase } from '../../../lib/supabase.js';
import { searchApi } from './search.api';

vi.mock('../../../lib/supabase.js', () => {
  const chain = {
    select: vi.fn(),
    order: vi.fn(),
    ilike: vi.fn(),
    eq: vi.fn(),
    gte: vi.fn(),
    lte: vi.fn(),
  };
  // Each method returns the chain to allow chaining
  Object.keys(chain).forEach((key) => chain[key].mockReturnValue(chain));

  return {
    supabase: {
      from: vi.fn(() => chain),
      _chain: chain,
    },
  };
});

describe('searchApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const chain = supabase._chain;
    Object.keys(chain).forEach((key) => chain[key].mockReturnValue(chain));
    supabase.from.mockReturnValue(chain);
  });

  it('queries public.users with default sort when no params given', async () => {
    await searchApi.search();

    expect(supabase.from).toHaveBeenCalledWith('users');
    expect(supabase._chain.order).toHaveBeenCalledWith('created_at', {
      ascending: false,
    });
  });

  it('applies ilike filter when q is provided', async () => {
    await searchApi.search({ q: 'alice' });

    expect(supabase._chain.ilike).toHaveBeenCalledWith('username', '%alice%');
  });

  it('applies eq filter when role is provided', async () => {
    await searchApi.search({ role: 'ADMIN' });

    expect(supabase._chain.eq).toHaveBeenCalledWith('role', 'ADMIN');
  });

  it('applies gte filter for joinedAfter as start-of-day UTC', async () => {
    await searchApi.search({ joinedAfter: '2024-01-01' });

    expect(supabase._chain.gte).toHaveBeenCalledWith(
      'created_at',
      '2024-01-01T00:00:00.000Z'
    );
  });

  it('applies lte filter for joinedBefore as end-of-day UTC', async () => {
    await searchApi.search({ joinedBefore: '2024-01-31' });

    expect(supabase._chain.lte).toHaveBeenCalledWith(
      'created_at',
      '2024-01-31T23:59:59.999Z'
    );
  });

  it('falls back to created_at for invalid sortBy values', async () => {
    await searchApi.search({ sortBy: 'password' });

    expect(supabase._chain.order).toHaveBeenCalledWith('created_at', {
      ascending: false,
    });
  });

  it('applies ascending order when sortDir is asc', async () => {
    await searchApi.search({ sortBy: 'username', sortDir: 'asc' });

    expect(supabase._chain.order).toHaveBeenCalledWith('username', {
      ascending: true,
    });
  });

  it('returns error for invalid section', async () => {
    const result = await searchApi.search({ section: 'posts' });

    expect(result.data).toBeNull();
    expect(result.error.message).toMatch(/invalid section/i);
  });
});
