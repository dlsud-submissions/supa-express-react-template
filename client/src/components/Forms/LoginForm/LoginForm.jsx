import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { supabase } from '../../../lib/supabase.js';
import { loginSchema } from '../../../modules/validators/auth/auth.validator.js';
import { useAuth } from '../../../providers/AuthProvider/AuthProvider';
import { useToast } from '../../../providers/ToastProvider/ToastProvider';
import AuthenticationError from '../../errors/AuthenticationError/AuthenticationError';
import ValidationError from '../../errors/ValidationError/ValidationError';
import styles from './LoginForm.module.css';

/**
 * Login form component for user authentication.
 * - Delegates auth to AuthProvider.login() which calls Supabase directly.
 * - AuthProvider.onAuthStateChange handles setting user state after success.
 * - Reads role directly from public.users after login to determine redirect,
 *   because the AuthProvider context updates asynchronously and user would
 *   still be null at the point navigate() is called.
 * @returns {JSX.Element} The rendered login form.
 */
const LoginForm = () => {
  const { showToast } = useToast();
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ username: '', password: '' });
  const [errorData, setErrorData] = useState({
    message: '',
    errors: [],
    isAuthError: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

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

      // AuthProvider sets user state asynchronously via onAuthStateChange, so
      // reading `user` from context here would return the pre-login (null) value.
      // Instead, fetch the profile directly from public.users using the fresh
      // session to determine the correct redirect destination.
      const {
        data: { session },
      } = await supabase.auth.getSession();

      let role = 'USER';
      if (session?.user?.id) {
        const { data: profile } = await supabase
          .from('users')
          .select('role')
          .eq('id', session.user.id)
          .single();
        if (profile?.role) role = profile.role;
      }

      const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN';
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
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Logging in...' : 'Enter'}
        </button>
      </form>

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
