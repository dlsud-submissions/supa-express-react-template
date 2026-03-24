import { Routes, Route } from 'react-router';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../../modules/utils/testing/testing.utils';
import { useAuth } from '../../providers/AuthProvider/AuthProvider';
import AdminRoute from './AdminRoute';

// Mock AuthProvider hook to control auth state
vi.mock('../../providers/AuthProvider/AuthProvider', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useAuth: vi.fn(),
    // Mock the Provider as a fragment to avoid internal useEffect/state updates
    AuthProvider: ({ children }) => children,
  };
});

// Mock the error page to simplify assertions
vi.mock('../../pages/errors/ForbiddenError/ForbiddenError', () => ({
  default: () => <div data-testid="forbidden">Forbidden Access</div>,
}));

describe('AdminRoute Component', () => {
  it('should render children when user has ADMIN role', () => {
    // --- Arrange ---
    vi.mocked(useAuth).mockReturnValue({
      user: { role: 'ADMIN' },
      loading: false,
    });

    // --- Act ---
    // Render admin route with nested content
    render(
      <Routes>
        <Route element={<AdminRoute />}>
          <Route path="/" element={<div>Admin Dashboard</div>} />
        </Route>
      </Routes>
    );

    // --- Assert ---
    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
  });

  it('should allow SUPER_ADMIN access to Admin routes', () => {
    // --- Arrange ---
    vi.mocked(useAuth).mockReturnValue({
      user: { role: 'SUPER_ADMIN' },
      loading: false,
    });

    // --- Act ---
    render(
      <Routes>
        <Route element={<AdminRoute />}>
          <Route path="/" element={<div>Admin Dashboard</div>} />
        </Route>
      </Routes>
    );

    // --- Assert ---
    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
  });

  it('should show ForbiddenError when user is a standard USER', () => {
    // --- Arrange ---
    vi.mocked(useAuth).mockReturnValue({
      user: { role: 'USER' },
      loading: false,
    });

    // --- Act ---
    render(
      <Routes>
        <Route element={<AdminRoute />}>
          <Route path="/" element={<div>Admin Dashboard</div>} />
        </Route>
      </Routes>
    );

    // --- Assert ---
    expect(screen.getByTestId('forbidden')).toBeInTheDocument();
    expect(screen.queryByText('Admin Dashboard')).not.toBeInTheDocument();
  });

  it('should render nothing during the loading state', () => {
    // --- Arrange ---
    vi.mocked(useAuth).mockReturnValue({ user: null, loading: true });

    // --- Act ---
    render(
      <Routes>
        <Route element={<AdminRoute />}>
          <Route path="/" element={<div data-testid="admin-content">Admin Dashboard</div>} />
        </Route>
      </Routes>
    );

    // --- Assert ---
    // Check that the protected content is not rendered
    expect(screen.queryByTestId('admin-content')).not.toBeInTheDocument();
    // Verify ForbiddenError is also not rendered
    expect(screen.queryByTestId('forbidden')).not.toBeInTheDocument();
  });
});