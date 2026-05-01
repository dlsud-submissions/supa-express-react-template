import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '../../../modules/utils/testing/testing.utils';
import { useAuth } from '../../../providers/AuthProvider/AuthProvider';
import { useToast } from '../../../providers/ToastProvider/ToastProvider';
import OAuthCallback from './OAuthCallback';

const mockNavigate = vi.fn();
const mockShowToast = vi.fn();
const mockClearAuthError = vi.fn();

vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock(
  '../../../providers/AuthProvider/AuthProvider',
  async (importOriginal) => {
    const actual = await importOriginal();
    return {
      ...actual,
      useAuth: vi.fn(),
      AuthProvider: ({ children }) => children,
    };
  }
);

vi.mock(
  '../../../providers/ToastProvider/ToastProvider',
  async (importOriginal) => {
    const actual = await importOriginal();
    return {
      ...actual,
      useToast: vi.fn(),
      ToastProvider: ({ children }) => children,
    };
  }
);

const renderCallback = (initialEntry = '/auth/callback?code=oauth-code') =>
  render(<OAuthCallback />, { initialEntries: [initialEntry] });

describe('OAuthCallback', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();

    vi.mocked(useAuth).mockReturnValue({
      user: null,
      loading: false,
      authError: null,
      clearAuthError: mockClearAuthError,
    });
    vi.mocked(useToast).mockReturnValue({ showToast: mockShowToast });
  });

  it('renders the splash spinner while auth state is loading', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      loading: true,
      authError: null,
      clearAuthError: mockClearAuthError,
    });

    renderCallback();

    expect(screen.getByText(/signing you in/i)).toBeInTheDocument();
    expect(screen.getByTestId('oauth-spinner')).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('redirects standard users to /dashboard once the profile is ready', async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 'user-1', role: 'USER', username: 'alex' },
      loading: false,
      authError: null,
      clearAuthError: mockClearAuthError,
    });

    renderCallback();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard', {
        replace: true,
      });
    });
  });

  it('redirects admins to /admin-dashboard once the profile is ready', async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 'user-2', role: 'ADMIN', username: 'odin' },
      loading: false,
      authError: null,
      clearAuthError: mockClearAuthError,
    });

    renderCallback();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/admin-dashboard', {
        replace: true,
      });
    });
  });

  it('shows an error toast and returns home when auth fails', async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      loading: false,
      authError: 'Failed to load user profile.',
      clearAuthError: mockClearAuthError,
    });

    renderCallback();

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith(
        'Failed to load user profile.',
        'error'
      );
      expect(mockClearAuthError).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
    });
  });
});
