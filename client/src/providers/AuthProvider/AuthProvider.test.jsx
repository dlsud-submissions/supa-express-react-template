import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { supabase } from '../../lib/supabase.js';
import { AuthProvider, useAuth } from './AuthProvider';

// Mock Supabase client
vi.mock('../../lib/supabase.js', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
    },
    from: vi.fn(),
  },
}));

const TestComponent = () => {
  const { user, loading, authError } = useAuth();
  if (loading) return <div data-testid="loading">Loading...</div>;
  return (
    <div>
      <div data-testid="user">{user ? user.username : 'Guest'}</div>
      <div data-testid="error">{authError || 'No Error'}</div>
    </div>
  );
};

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock implementation for getSession
    supabase.auth.getSession.mockResolvedValue({ data: { session: null } });
  });

  it('shows guest state when no session exists on mount', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });
    expect(screen.getByTestId('user')).toHaveTextContent('Guest');
  });

  it('fetches profile and sets user when session exists on mount', async () => {
    const mockUser = { id: '123', email: 'test@app.local' };
    supabase.auth.getSession.mockResolvedValue({
      data: { session: { user: mockUser } },
    });

    // Mock the profile fetch from public.users
    const mockFrom = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { id: '123', username: 'tester', role: 'admin' },
        error: null,
      }),
    };
    supabase.from.mockReturnValue(mockFrom);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('tester');
    });
  });

  it('updates state when auth event SIGNED_OUT occurs', async () => {
    let authCallback;
    supabase.auth.onAuthStateChange.mockImplementation((cb) => {
      authCallback = cb;
      return { data: { subscription: { unsubscribe: vi.fn() } } };
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Manually trigger the signed out event
    await waitFor(() => authCallback('SIGNED_OUT', null));

    expect(screen.getByTestId('user')).toHaveTextContent('Guest');
  });

  it('sets error state when profile fetch fails', async () => {
    const mockUser = { id: '123' };
    supabase.auth.getSession.mockResolvedValue({
      data: { session: { user: mockUser } },
    });

    supabase.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi
        .fn()
        .mockResolvedValue({ data: null, error: { message: 'DB Error' } }),
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent(
        'Failed to load user profile.'
      );
    });
  });
});
