import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from '../../providers/AuthProvider/AuthProvider';

/**
 * Route guard for authenticated pages.
 * - Redirects to landing page if user is not authenticated.
 * - Redirects to /verify-email if authenticated but email not verified.
 * - Redirects to /setup-username if verified but username not yet chosen
 *   (covers OAuth users who skipped the username step).
 * - Preserves the attempted location in state for post-login redirection.
 * @returns {JSX.Element}
 */
const AuthRoute = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Wait for session rehydration before making any routing decisions
  if (loading) return null;

  // Not logged in → back to landing page
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

  // Logged in but email not verified → prompt OTP verification
  if (!user.is_verified) {
    return <Navigate to="/verify-email" state={{ from: location }} replace />;
  }

  // Verified but username not yet chosen (OAuth path) → prompt username setup
  if (!user.username_confirmed) {
    return <Navigate to="/setup-username" state={{ from: location }} replace />;
  }

  // Fully authenticated, verified, and username set → render protected content
  return <Outlet />;
};

export default AuthRoute;
