import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../../../modules/utils/testing/testing.utils';
import { useAuth } from '../../../providers/AuthProvider/AuthProvider';
import AdminDashboard from './AdminDashboard';

// Mock AuthProvider module to control state and prevent internal side effects
vi.mock('../../../providers/AuthProvider/AuthProvider', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useAuth: vi.fn(),
    // Replace provider with fragment to stop background auth checks during tests
    AuthProvider: ({ children }) => children,
  };
});

describe('AdminDashboard Component', () => {
  it('renders a personalized welcome message for the admin', () => {
    // --- Arrange ---
    vi.mocked(useAuth).mockReturnValue({
      user: { username: 'Admin_Alpha', role: 'ADMIN' },
    });

    // --- Act ---
    // Custom render handles MemoryRouter and required providers
    render(<AdminDashboard />);

    // --- Assert ---
    expect(screen.getByText(/welcome back, admin_alpha/i)).toBeInTheDocument();
  });

  it('renders the core administrative links', () => {
    // --- Arrange ---
    vi.mocked(useAuth).mockReturnValue({
      user: { username: 'admin', role: 'ADMIN' },
    });

    // --- Act ---
    render(<AdminDashboard />);

    // --- Assert ---
    expect(screen.getByRole('link', { name: /users/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /logs/i })).toBeInTheDocument();
  });

  it('applies standard styles for regular admin users', () => {
    // --- Arrange ---
    vi.mocked(useAuth).mockReturnValue({
      user: { username: 'admin', role: 'ADMIN' },
    });

    // --- Act ---
    render(<AdminDashboard />);

    // --- Assert ---
    const settingsLink = screen.getByRole('link', { name: /settings/i });
    expect(settingsLink).not.toHaveClass(/criticalCard/i);
  });

  it('highlights settings for super admin users', () => {
    // --- Arrange ---
    vi.mocked(useAuth).mockReturnValue({
      user: { username: 'superadmin', role: 'SUPER_ADMIN' },
    });

    // --- Act ---
    render(<AdminDashboard />);

    // --- Assert ---
    const settingsLink = screen.getByRole('link', { name: /settings/i });
    // Verify critical styling is applied for high-privilege roles
    expect(settingsLink).toHaveClass(/criticalCard/i);
    expect(screen.getByTestId('icon-ShieldAlert')).toBeInTheDocument();
  });
});