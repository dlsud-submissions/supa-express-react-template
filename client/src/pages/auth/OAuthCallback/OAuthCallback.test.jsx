import { useNavigate } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '../../../modules/utils/testing/testing.utils';
import { useAuth } from '../../../providers/AuthProvider/AuthProvider';
import OAuthCallback from './OAuthCallback';

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

describe('OAuthCallback', () => {
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);
  });

  it('renders a spinner while loading is true', () => {
    // --- Arrange ---
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      loading: true,
      authError: null,
    });

    // --- Act ---
    render(<OAuthCallback />);

    // --- Assert ---
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText(/signing you in/i)).toBeInTheDocument();
  });

  it('redirects to /dashboard for USER role after user is set', () => {
    // --- Arrange ---
    vi.mocked(useAuth).mockReturnValue({
      user: { username: 'alice', role: 'USER' },
      loading: false,
      authError: null,
    });

    // --- Act ---
    render(<OAuthCallback />);

    // --- Assert ---
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
  });

  it('redirects to /admin-dashboard for ADMIN role after user is set', () => {
    // --- Arrange ---
    vi.mocked(useAuth).mockReturnValue({
      user: { username: 'boss', role: 'ADMIN' },
      loading: false,
      authError: null,
    });

    // --- Act ---
    render(<OAuthCallback />);

    // --- Assert ---
    expect(mockNavigate).toHaveBeenCalledWith('/admin-dashboard', {
      replace: true,
    });
  });

  it('redirects to / when loading is false and no user or error', () => {
    // --- Arrange ---
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      loading: false,
      authError: null,
    });

    // --- Act ---
    render(<OAuthCallback />);

    // --- Assert ---
    expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
  });

  it('redirects to / and shows error when authError is set', () => {
    // --- Arrange ---
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      loading: false,
      authError: 'Unsupported provider: provider is not enabled',
    });

    // --- Act ---
    render(<OAuthCallback />);

    // --- Assert ---
    expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
  });
});
