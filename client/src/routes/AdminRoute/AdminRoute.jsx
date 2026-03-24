import { Outlet } from 'react-router';
import { useAuth } from '../../providers/AuthProvider/AuthProvider';
import ForbiddenError from '../../pages/errors/ForbiddenError/ForbiddenError';

/**
 * Route guard for administrative pages.
 * - Assumes AuthRoute has already verified user presence.
 * - Validates if the authenticated user has the ADMIN or SUPER_ADMIN role.
 * @returns {JSX.Element}
 */
const AdminRoute = () => {
  const { user, loading } = useAuth();

  // Guard against sync delay
  if (loading) return null;

  // Role check: ADMIN and SUPER_ADMIN are permitted
  const hasAccess = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

  // If the user exists but lacks privileges, show Forbidden UI
  if (!hasAccess) {
    return <ForbiddenError />;
  }

  // Render nested admin content
  return <Outlet />;
};

export default AdminRoute;
