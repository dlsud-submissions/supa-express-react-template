import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useAuth } from '../../../providers/AuthProvider/AuthProvider';
import { useToast } from '../../../providers/ToastProvider/ToastProvider';
import styles from './OAuthCallback.module.css';

/**
 * Public OAuth callback splash page.
 * - Waits for Supabase to exchange the OAuth code on return from Google.
 * - Redirects authenticated users to the correct dashboard once profile
 *   data is available from AuthProvider.
 * - Falls back to a toast and home redirect when the callback is invalid
 *   or the auth flow fails to produce a user session.
 * @returns {JSX.Element}
 */
const OAuthCallback = () => {
  const { user, loading, authError, clearAuthError } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [exchangeTimedOut, setExchangeTimedOut] = useState(false);
  const handledRef = useRef(false);

  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );
  const code = searchParams.get('code');
  const providerError =
    searchParams.get('error_description') || searchParams.get('error');

  useEffect(() => {
    if (!code || user || authError || providerError) return undefined;

    const timeoutId = window.setTimeout(() => {
      setExchangeTimedOut(true);
    }, 2500);

    return () => window.clearTimeout(timeoutId);
  }, [authError, code, providerError, user]);

  useEffect(() => {
    if (!user || handledRef.current) return;

    handledRef.current = true;
    const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';
    navigate(isAdmin ? '/admin-dashboard' : '/dashboard', { replace: true });
  }, [navigate, user]);

  useEffect(() => {
    if (handledRef.current || loading) return;

    if (providerError) {
      handledRef.current = true;
      showToast(decodeURIComponent(providerError), 'error');
      navigate('/', { replace: true });
      return;
    }

    if (authError) {
      handledRef.current = true;
      showToast(authError, 'error');
      clearAuthError();
      navigate('/', { replace: true });
      return;
    }

    if (!code) {
      handledRef.current = true;
      showToast('Missing Google OAuth callback code.', 'error');
      navigate('/', { replace: true });
      return;
    }

    if (exchangeTimedOut) {
      handledRef.current = true;
      showToast('Google sign-in could not be completed. Please try again.', 'error');
      navigate('/', { replace: true });
    }
  }, [
    authError,
    clearAuthError,
    code,
    exchangeTimedOut,
    loading,
    navigate,
    providerError,
    showToast,
  ]);

  return (
    <main className={`${styles.page} animate-fade-in`}>
      <section className={styles.card} aria-live="polite">
        <div
          className={styles.spinner}
          aria-hidden="true"
          data-testid="oauth-spinner"
        />
        <h1 className={styles.title}>Signing you in...</h1>
        <p className={styles.message}>
          We&apos;re finishing your Google login and loading your dashboard.
        </p>
      </section>
    </main>
  );
};

export default OAuthCallback;
