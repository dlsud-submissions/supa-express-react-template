import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { supabase } from '../../lib/supabase.js';
import { ToastProvider } from '../ToastProvider/ToastProvider';
import { AuthProvider, useAuth } from './AuthProvider';

// Unmock the provider to test its actual implementation
vi.unmock('./AuthProvider');

/**
 * Test consumer that exposes auth context values for assertions.
 */
const TestConsumer = () => {
  const { user, authError, clearAuthError, login, logout } = useAuth();
  return (
    <div>
      <span data-testid="user">{user ? user.username : 'Guest'}</span>
      <span data-testid="error">{authError || 'No Error'}</span>
      <button onClick={() => login({ username: 'alice', password: 'pw' })}>
        Login
      </button>
      <button onClick={clearAuthError}>Clear Error</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

/**
 * Renders the AuthProvider with its required ToastProvider dependency.
 */
const renderWithDeps = (ui) =>
  render(
    <ToastProvider>
      <AuthProvider>{ui}</AuthProvider>
    </ToastProvider>
  );

/**
 * Captures the onAuthStateChange callback registered by AuthProvider
 * so tests can fire synthetic auth events.
 */
const captureAuthStateChange = () => {
  let changeCallback;
  vi.mocked(supabase.auth.onAuthStateChange).mockImplementation((cb) => {
    changeCallback = cb;
    return { data: { subscription: { unsubscribe: vi.fn() } } };
  });
  return () => changeCallback;
};

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: no active session on mount
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
    });
    vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });
  });

  it('renders guest state when no session exists on mount', async () => {
    renderWithDeps(<TestConsumer />);

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('Guest');
    });
    expect(screen.getByTestId('error')).toHaveTextContent('No Error');
  });

  it('sets user state when SIGNED_IN event fires with a valid profile', async () => {
    // --- Arrange ---
    const getCallback = captureAuthStateChange();

    // Mock the public.users profile fetch that happens after SIGNED_IN
    supabase._queryChain.single.mockResolvedValueOnce({
      data: { id: 'uuid-1', username: 'alice', role: 'USER' },
      error: null,
    });

    renderWithDeps(<TestConsumer />);

    // Wait for mount to complete
    await waitFor(() => expect(getCallback()).toBeDefined());

    // --- Act ---
    await act(async () => {
      getCallback()('SIGNED_IN', { user: { id: 'uuid-1' } });
    });

    // --- Assert ---
    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('alice');
    });
    expect(screen.getByTestId('error')).toHaveTextContent('No Error');
  });

  it('clears user state on SIGNED_OUT event', async () => {
    // --- Arrange ---
    const getCallback = captureAuthStateChange();

    // First sign in
    supabase._queryChain.single.mockResolvedValueOnce({
      data: { id: 'uuid-1', username: 'alice', role: 'USER' },
      error: null,
    });

    renderWithDeps(<TestConsumer />);
    await waitFor(() => expect(getCallback()).toBeDefined());

    await act(async () => {
      getCallback()('SIGNED_IN', { user: { id: 'uuid-1' } });
    });
    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('alice');
    });

    // --- Act ---
    await act(async () => {
      getCallback()('SIGNED_OUT', null);
    });

    // --- Assert ---
    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('Guest');
    });
  });

  it('sets authError when login returns a Supabase error', async () => {
    // --- Arrange ---
    const user = userEvent.setup();
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({
      data: null,
      error: { message: 'Invalid login credentials' },
    });

    renderWithDeps(<TestConsumer />);

    // --- Act ---
    await user.click(screen.getByRole('button', { name: /login/i }));

    // --- Assert ---
    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent(
        'Invalid login credentials'
      );
    });
  });

  it('clears authError when clearAuthError is called', async () => {
    // --- Arrange ---
    const user = userEvent.setup();
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({
      data: null,
      error: { message: 'Invalid login credentials' },
    });

    renderWithDeps(<TestConsumer />);

    await user.click(screen.getByRole('button', { name: /login/i }));
    await waitFor(() => {
      expect(screen.getByTestId('error')).not.toHaveTextContent('No Error');
    });

    // --- Act ---
    await user.click(screen.getByRole('button', { name: /clear error/i }));

    // --- Assert ---
    expect(screen.getByTestId('error')).toHaveTextContent('No Error');
  });

  it('unsubscribes from onAuthStateChange on unmount', async () => {
    // --- Arrange ---
    const unsubscribe = vi.fn();
    vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue({
      data: { subscription: { unsubscribe } },
    });

    const { unmount } = renderWithDeps(<TestConsumer />);

    // --- Act ---
    unmount();

    // --- Assert ---
    expect(unsubscribe).toHaveBeenCalled();
  });
});
