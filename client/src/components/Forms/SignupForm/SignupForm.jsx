import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { authApi } from '../../../modules/api/auth/auth.api.js';
import { signupSchema } from '../../../modules/validators/auth/auth.validator.js';
import { useAuth } from '../../../providers/AuthProvider/AuthProvider';
import { useToast } from '../../../providers/ToastProvider/ToastProvider';
import GoogleAuthButton from '../../buttons/GoogleAuthButton/GoogleAuthButton';
import ValidationError from '../../errors/ValidationError/ValidationError';
import styles from './SignupForm.module.css';

/**
 * Signup form component for user registration.
 * - Calls authApi.signup() which uses Supabase Auth directly.
 * - Navigates to /log-in on success.
 * - Handles { data, error } return shape from Supabase SDK.
 * - Supports Google OAuth via AuthProvider.loginWithGoogle().
 * @returns {JSX.Element} The rendered signup form.
 */
const SignupForm = () => {
  const { loginWithGoogle } = useAuth();
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errorData, setErrorData] = useState({ message: '', errors: [] });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const navigate = useNavigate();

  /**
   * Updates local state and clears errors on input change.
   * @param {React.ChangeEvent<HTMLInputElement>} e
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorData.message) setErrorData({ message: '', errors: [] });
  };

  /**
   * Processes the signup submission via Supabase authApi.
   * @param {React.FormEvent} e
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorData({ message: '', errors: [] });

    // Validate form data against Zod schema
    const validation = signupSchema.safeParse(formData);

    if (!validation.success) {
      setErrorData({
        message: 'Validation failed',
        errors: validation.error.issues.map((issue) => ({
          msg: issue.message,
        })),
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await authApi.signup(formData);

      if (error) {
        setErrorData({
          message: error.message || 'Signup failed',
          errors: [],
        });
        return;
      }

      navigate('/log-in');
    } catch (err) {
      setErrorData({
        message: `An error occurred: ${err.message}`,
        errors: [],
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Initiates the Google OAuth redirect via AuthProvider.loginWithGoogle().
   * - Google accounts are created automatically on first login.
   * - Surfaces any error (e.g. provider not enabled) as a toast.
   */
  const handleGoogleSignup = async () => {
    setIsGoogleLoading(true);
    const { error } = await loginWithGoogle();
    if (error) {
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
      <h2>Create Account</h2>

      {/* Conditional validation feedback */}
      <ValidationError message={errorData.message} errors={errorData.errors} />

      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        <div className={styles.inputGroup}>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
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

        <div className={styles.inputGroup}>
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
        </div>

      try {
        const { data, error } = await authApi.signup({
          email: formData.email,
          password: formData.password,
        });

        if (error) {
          setErrorData({
            message: error.message || 'Signup failed',
            errors: [],
          });
          return;
        }

        const userId = data?.user?.id ?? data?.id;
        await authApi.sendOtp(userId, formData.email, 'email_verification');
        navigate('/verify-email', { state: { userId, email: formData.email } });
      } catch (err) {
      <GoogleAuthButton
        onClick={handleGoogleSignup}
        isLoading={isGoogleLoading}
        label="Sign up with Google"
      />

      <p className={styles.footerText}>
        Already have an account?{' '}
        <Link to="/log-in" className={styles.link}>
          Log In
        </Link>
      </p>
    </div>
  );
};

export default SignupForm;
