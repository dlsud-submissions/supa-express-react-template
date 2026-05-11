// client\src\routes\AuthRoute\AuthRoute.jsx
import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from '../../providers/AuthProvider/AuthProvider';

/**
 * Route guard for authenticated pages.
 * - Redirects to login if user is not authenticated.
 * - Preserves the attempted location in state for post-login redirection.
 * @returns {JSX.Element}
 */
const AuthRoute = () => {
  const { user, loading, needsUsername, isVerified } = useAuth();
  const location = useLocation();

  if (loading) return null;

  // Redirect to Landing Page instead of login
  if (!user) {
    return (
      <Navigate
        to="/"
        state={{
          from: location,
          message: 'Please log in to access this page',
        }}
        replace
      />
    );
  }

  // Redirect Google users with a collision username to complete-profile
  if (
    needsUsername &&
    location.pathname !== '/complete-profile' &&
    location.pathname !== '/setup-username'
  ) {
    return (
      <Navigate to="/setup-username" state={{ userId: user?.id }} replace />
    );
  }

  // Redirect unverified users to email verification
  if (!isVerified && location.pathname !== '/verify-email') {
    return (
      <Navigate
        to="/verify-email"
        state={{ userId: user?.id, email: user?.email }}
        replace
      />
    );
  }

  // Render children (protected content)
  return <Outlet />;
};

export default AuthRoute;
