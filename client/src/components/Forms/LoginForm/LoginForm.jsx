import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { loginSchema } from '../../../modules/validators/auth/auth.validator.js';
import { useAuth } from '../../../providers/AuthProvider/AuthProvider';
import { useToast } from '../../../providers/ToastProvider/ToastProvider';
import GoogleAuthButton from '../../buttons/GoogleAuthButton/GoogleAuthButton';
import AuthenticationError from '../../errors/AuthenticationError/AuthenticationError';
import ValidationError from '../../errors/ValidationError/ValidationError';
import styles from './LoginForm.module.css';

/**
 * Login form component for user authentication.
 * - Delegates auth to AuthProvider.login() which calls Supabase directly.
 * - AuthProvider.onAuthStateChange handles setting user state after success.
 * - Redirects based on user role after the provider updates user state.
 * - Supports Google OAuth via AuthProvider.loginWithGoogle().
 * @returns {JSX.Element} The rendered login form.
 */
const LoginForm = () => {
  const { showToast } = useToast();
  const { login, loginWithGoogle, user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ username: '', password: '' });
  const [errorData, setErrorData] = useState({
    message: '',
    errors: [],
    isAuthError: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  /**
   * Updates local state and clears errors on input change.
   * @param {React.ChangeEvent<HTMLInputElement>} e
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorData.message) {
      setErrorData({ message: '', errors: [], isAuthError: false });
    }
  };

  /**
   * Processes form submission via AuthProvider.login().
   * @param {React.FormEvent} e
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side validation before hitting Supabase
    const validation = loginSchema.safeParse(formData);
    if (!validation.success) {
      setErrorData({
        message: 'Invalid credentials format',
        errors: validation.error.issues.map((i) => ({ msg: i.message })),
        isAuthError: false,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await login(formData);

      if (error) {
        setErrorData({
          message: error.message || 'Login failed',
          errors: [],
          isAuthError: true,
        });
        return;
      }

      showToast('Successfully logged in', 'success');

      // user state is set by AuthProvider via onAuthStateChange
      // Navigate based on role — re-read from the updated context
      const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
      navigate(isAdmin ? '/admin-dashboard' : '/dashboard');
    } catch (err) {
      setErrorData({
        message: `Connection error: ${err.message}`,
        errors: [],
        isAuthError: false,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Initiates the Google OAuth redirect via AuthProvider.loginWithGoogle().
   * - Shows a loading state until the browser navigates away.
   * - Surfaces any error (e.g. provider not enabled) as a toast.
   */
  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    const { error } = await loginWithGoogle();
    if (error) {
      // Provider not enabled or other config error — surface it clearly
      showToast(
        error.message?.includes('provider is not enabled')
          ? 'Google sign-in is not configured yet. Please use username and password.'
          : `Google sign-in failed: ${error.message}`,
        'error'
      );
      setIsGoogleLoading(false);
    }
    // On success the browser redirects — loading stays true until navigation
  };

  return (
    <div className={`${styles.formContainer} animate-fade-in`}>
      <h2>Log In</h2>

      {/* Conditional Error Feedback */}
      {errorData.isAuthError ? (
        <AuthenticationError message={errorData.message} />
      ) : (
        <ValidationError
          message={errorData.message}
          errors={errorData.errors}
        />
      )}

      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        <div className={styles.inputGroup}>
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <button
          type="submit"
          className={styles.submitBtn}
          disabled={isSubmitting || isGoogleLoading}
        >
          {isSubmitting ? 'Logging in...' : 'Enter'}
        </button>
      </form>

      <div className={styles.divider}>
        <span className={styles.dividerText}>or</span>
      </div>

      <GoogleAuthButton
        onClick={handleGoogleLogin}
        isLoading={isGoogleLoading}
      />

      <p className={styles.footerText}>
        Don't have an account?{' '}
        <Link to="/sign-up" className={styles.link}>
          Sign Up
        </Link>
      </p>
    </div>
  );
};

export default LoginForm;
