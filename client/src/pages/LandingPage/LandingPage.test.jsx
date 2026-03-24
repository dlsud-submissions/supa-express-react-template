import { describe, it, expect, vi } from 'vitest';
import { Navigate } from 'react-router';
import { render, screen } from '../../modules/utils/testing/testing.utils';
import { useAuth } from '../../providers/AuthProvider/AuthProvider';
import LandingPage from './LandingPage';

// Partial mock to keep AuthProvider component but mock the hook for state control
vi.mock('../../providers/AuthProvider/AuthProvider', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useAuth: vi.fn(),
  };
});

describe('LandingPage', () => {
  it('renders hero content and CTA links for guests', () => {
    // --- Arrange ---
    // Simulate guest user state
    vi.mocked(useAuth).mockReturnValue({ user: null });

    // --- Act ---
    // Custom render provides MemoryRouter and AuthProvider
    render(<LandingPage />);

    // --- Assert ---
    expect(screen.getByText(/Welcome to the App/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Get Started/i })).toHaveAttribute(
      'href',
      '/sign-up'
    );
    expect(screen.getByRole('link', { name: /Log In/i })).toHaveAttribute(
      'href',
      '/log-in'
    );
  });

  it('redirects to dashboard when user is already logged in', () => {
    // --- Arrange ---
    // Simulate logged in user state
    vi.mocked(useAuth).mockReturnValue({
      user: { username: 'Boss', role: 'USER' },
    });

    // --- Act ---
    render(<LandingPage />);

    // --- Assert ---
    // Navigate is mocked globally in vitest.setup.jsx
    expect(Navigate).toHaveBeenCalledWith(
      expect.objectContaining({ to: '/dashboard' }),
      undefined
    );
  });
});
