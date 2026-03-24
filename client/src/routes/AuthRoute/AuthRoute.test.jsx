import { Routes, Route } from 'react-router';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../../modules/utils/testing/testing.utils';
import { useAuth } from '../../providers/AuthProvider/AuthProvider';
import AuthRoute from './AuthRoute';

// Mock AuthProvider as a fragment to stop its internal useEffects
vi.mock('../../providers/AuthProvider/AuthProvider', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    AuthProvider: ({ children }) => <>{children}</>,
    useAuth: vi.fn(),
  };
});

// Override the global Navigate mock to allow actual redirection
vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
  };
});

describe('AuthRoute Component', () => {
  it('should render children when user is authenticated', () => {
    // --- Arrange ---
    // Simulate active session
    vi.mocked(useAuth).mockReturnValue({
      user: { username: 'testuser' },
      loading: false,
    });

    // --- Act ---
    // Render protected route
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
    // Simulate guest session
    vi.mocked(useAuth).mockReturnValue({ user: null, loading: false });

    // --- Act ---
    // Render routes with landing page destination
    render(
      <Routes>
        <Route path="/" element={<div>Landing Page Content</div>} />
        <Route element={<AuthRoute />}>
          <Route path="/protected" element={<div>Protected Content</div>} />
        </Route>
      </Routes>,
      { initialEntries: ['/protected'] }
    );

    // --- Assert ---
    // Verify protected content is replaced by landing page content
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    expect(screen.getByText('Landing Page Content')).toBeInTheDocument();
  });

  it('should render nothing while loading session status', () => {
    // --- Arrange ---
    // Simulate session initialization
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
    // Filter out provider containers like Toast
    const appContent = container.querySelector(
      'div:not([class*="container_deb008"])'
    );
    expect(appContent).toBeNull();
  });
});
