import { Route, Routes } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '../../modules/utils/testing/testing.utils';
import { useAuth } from '../../providers/AuthProvider/AuthProvider';
import AuthRoute from './AuthRoute';

// Mock AuthProvider as a passthrough fragment so customRender's wrapper
// does not mount the real AuthProvider (which calls supabase.auth.getSession
// on mount and overwrites the useAuth mock return value).
vi.mock('../../providers/AuthProvider/AuthProvider', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    AuthProvider: ({ children }) => <>{children}</>,
    useAuth: vi.fn(),
  };
});

// Restore real react-router so Navigate and Outlet work correctly.
vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual };
});

describe('AuthRoute Component', () => {
  it('should render children when user is authenticated, verified, and username is confirmed', () => {
    // --- Arrange ---
    vi.mocked(useAuth).mockReturnValue({
      user: {
        username: 'testuser',
        is_verified: true,
        username_confirmed: true,
      },
      loading: false,
    });

    // --- Act ---
    render(
      <Routes>
        <Route element={<AuthRoute />}>
          <Route path="/protected" element={<div>Protected Content</div>} />
        </Route>
      </Routes>,
      { initialEntries: ['/protected'] }
    );

    // --- Assert ---
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('should redirect to landing page when user is unauthenticated', () => {
    // --- Arrange ---
    vi.mocked(useAuth).mockReturnValue({ user: null, loading: false });

    // --- Act ---
    render(
      <Routes>
        <Route path="/" element={<div>Landing Page Content</div>} />
        <Route path="/verify-email" element={<div>Verify Email Content</div>} />
        <Route element={<AuthRoute />}>
          <Route path="/protected" element={<div>Protected Content</div>} />
        </Route>
      </Routes>,
      { initialEntries: ['/protected'] }
    );

    // --- Assert ---
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    expect(screen.getByText('Landing Page Content')).toBeInTheDocument();
  });

  it('should redirect to /verify-email when user is authenticated but not verified', () => {
    // --- Arrange ---
    vi.mocked(useAuth).mockReturnValue({
      user: {
        username: 'testuser',
        is_verified: false,
        username_confirmed: true,
      },
      loading: false,
    });

    // --- Act ---
    render(
      <Routes>
        <Route path="/verify-email" element={<div>Verify Email Content</div>} />
        <Route element={<AuthRoute />}>
          <Route path="/protected" element={<div>Protected Content</div>} />
        </Route>
      </Routes>,
      { initialEntries: ['/protected'] }
    );

    // --- Assert ---
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    expect(screen.getByText('Verify Email Content')).toBeInTheDocument();
  });

  it('should redirect to /setup-username when verified but username not yet confirmed', () => {
    // --- Arrange ---
    // Covers OAuth users who completed verification but skipped username setup
    vi.mocked(useAuth).mockReturnValue({
      user: { username: null, is_verified: true, username_confirmed: false },
      loading: false,
    });

    // --- Act ---
    render(
      <Routes>
        <Route
          path="/setup-username"
          element={<div>Setup Username Content</div>}
        />
        <Route element={<AuthRoute />}>
          <Route path="/protected" element={<div>Protected Content</div>} />
        </Route>
      </Routes>,
      { initialEntries: ['/protected'] }
    );

    // --- Assert ---
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    expect(screen.getByText('Setup Username Content')).toBeInTheDocument();
  });

  it('should render nothing while loading session status', () => {
    // --- Arrange ---
    vi.mocked(useAuth).mockReturnValue({ user: null, loading: true });

    // --- Act ---
    const { container } = render(
      <Routes>
        <Route element={<AuthRoute />}>
          <Route path="/protected" element={<div>Protected Content</div>} />
        </Route>
      </Routes>,
      { initialEntries: ['/protected'] }
    );

    // --- Assert ---
    const appContent = container.querySelector(
      'div:not([class*="container_deb008"])'
    );
    expect(appContent).toBeNull();
  });
});
