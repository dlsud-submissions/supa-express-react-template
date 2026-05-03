import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import Spinner from '../../../components/feedback/Spinner/Spinner';
import { useAuth } from '../../../providers/AuthProvider/AuthProvider';
import { useToast } from '../../../providers/ToastProvider/ToastProvider';
import styles from './OAuthCallback.module.css';

/**
 * OAuth callback splash page.
 * - Supabase exchanges the ?code= param automatically on mount
 *   because detectSessionInUrl: true is set in supabase.js.
 * - This page shows a spinner while AuthProvider.onAuthStateChange
 *   fires SIGNED_IN and populates the user context.
 * - Redirects to the appropriate dashboard once user is available.
 * - Redirects to / with a toast if the session never materializes
 *   (e.g. expired or invalid code, provider not enabled).
 * @returns {JSX.Element}
 */
const OAuthCallback = () => {
  const { user, loading, authError } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    // Still waiting for Supabase to exchange the code — do nothing
    if (loading) return;

    if (authError) {
      showToast(authError, 'error');
      navigate('/', { replace: true });
      return;
    }

    if (user) {
      const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';
      navigate(isAdmin ? '/admin-dashboard' : '/dashboard', { replace: true });
      return;
    }

    // loading is false, no error, no user — something went wrong
    showToast('Sign-in failed. Please try again.', 'error');
    navigate('/', { replace: true });
  }, [loading, user, authError, navigate, showToast]);

  return (
    <div className={`${styles.container} flex-center animate-fade-in`}>
      <Spinner size="3rem" message="Signing you in..." />
    </div>
  );
};

export default OAuthCallback;
