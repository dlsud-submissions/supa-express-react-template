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
  const { user, loading } = useAuth();
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

  // Render children (protected content)
  return <Outlet />;
};

export default AuthRoute;
