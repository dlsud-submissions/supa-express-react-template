import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthProvider, useAuth } from './AuthProvider';
import { ToastProvider } from '../ToastProvider/ToastProvider';

// Unmock the provider to test its actual implementation logic
vi.unmock('./AuthProvider');

/**
 * Enhanced helper component to test error state consumption.
 * * @returns {JSX.Element} Interactive test interface for AuthProvider
 */
const TestComponent = () => {
  const { user, login, authError, clearAuthError } = useAuth();
  return (
    <div>
      <span data-testid="user-status">{user ? user.username : 'Guest'}</span>
      <span data-testid="auth-error">{authError || 'No Error'}</span>
      <button onClick={() => login({ username: 'tester' })}>Mock Login</button>
      <button onClick={clearAuthError}>Clear Error</button>
    </div>
  );
};

/**
 * Manual wrapper for this test to avoid recursive AuthProvider nesting from test-utils.
 * * @param {React.ReactNode} ui - Component to render
 * @returns {Object} RTL render result
 */
const renderWithDependencies = (ui) => {
  // Use standard render to avoid the global AuthProvider in test-utils
  return render(
    <ToastProvider>
      <AuthProvider>{ui}</AuthProvider>
    </ToastProvider>
  );
};

describe('AuthProvider', () => {
  beforeEach(() => {
    // Reset all mock implementations and histories before each test
    vi.resetAllMocks();
  });

  it('provides guest status by default and updates on login', async () => {
    // --- Arrange ---
    // Handle on-mount check failure then login success
    fetch.mockResolvedValueOnce({ ok: false }).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user: { username: 'tester' } }),
    });
    const user = userEvent.setup();

    // --- Act ---
    renderWithDependencies(<TestComponent />);
    const loginBtn = screen.getByRole('button', { name: /mock login/i });
    await user.click(loginBtn);

    // --- Assert ---
    await waitFor(() => {
      expect(screen.getByTestId('user-status')).toHaveTextContent('tester');
    });
    expect(screen.getByTestId('auth-error')).toHaveTextContent('No Error');
  });

  it('sets an error message when a 401 unauthorized response occurs', async () => {
    // --- Arrange ---
    // Force 401 response on the mount-time fetch
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
    });

    // --- Act ---
    renderWithDependencies(<TestComponent />);

    // --- Assert ---
    await waitFor(() => {
      // Confirm the error state matches the logic in AuthProvider.jsx
      expect(screen.getByTestId('auth-error')).toHaveTextContent(
        /session has expired/i
      );
      expect(screen.getByTestId('user-status')).toHaveTextContent('Guest');
    });
  });

  it('sets a connection error message when the fetch fails', async () => {
    // --- Arrange ---
    // Simulate a network-level failure on mount
    fetch.mockRejectedValueOnce(new Error('Network Down'));

    // --- Act ---
    renderWithDependencies(<TestComponent />);

    // --- Assert ---
    await waitFor(() => {
      // Verify the catch block logic in AuthProvider.jsx
      expect(screen.getByTestId('auth-error')).toHaveTextContent(
        /unable to connect/i
      );
    });
  });

  it('clears the error message when clearAuthError is called', async () => {
    // --- Arrange ---
    // Trigger 401 error on mount
    fetch.mockResolvedValueOnce({ ok: false, status: 401 });
    const user = userEvent.setup();

    // --- Act ---
    renderWithDependencies(<TestComponent />);

    // Ensure error is present before attempting to clear
    await waitFor(() =>
      expect(screen.getByTestId('auth-error')).not.toHaveTextContent('No Error')
    );

    const clearBtn = screen.getByRole('button', { name: /clear error/i });
    await user.click(clearBtn);

    // --- Assert ---
    expect(screen.getByTestId('auth-error')).toHaveTextContent('No Error');
  });
});
