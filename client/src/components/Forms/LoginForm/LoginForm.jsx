import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../../../providers/AuthProvider/AuthProvider';
import { useToast } from '../../../providers/ToastProvider/ToastProvider';
import { loginSchema } from '../../../modules/validators/auth/auth.validator.js';
import { authApi } from '../../../modules/api/auth/auth.api.js';
import ValidationError from '../../errors/ValidationError/ValidationError';
import AuthenticationError from '../../errors/AuthenticationError/AuthenticationError';
import styles from './LoginForm.module.css';

/**
 * Login form component for user authentication.
 * - Manages credentials state and interaction.
 * - Synchronizes global auth state via useAuth on success.
 * - Redirects based on user role (Admin vs User).
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
    status: null,
  });

  /**
   * Updates local state and clears errors on input change.
   * @param {React.ChangeEvent<HTMLInputElement>} e
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorData.message) {
      setErrorData({ message: '', errors: [], status: null });
    }
  };

  /**
   * Processes form submission, validation, and API authentication.
   * @param {React.FormEvent} e
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate inputs locally before hitting API
    const validation = loginSchema.safeParse(formData);
    if (!validation.success) {
      setErrorData({
        message: 'Invalid credentials format',
        errors: validation.error.issues.map((i) => ({ msg: i.message })),
        status: 400,
      });
    }

    try {
      const response = await authApi.login(formData);

      if (response.ok) {
        const data = await response.json();

        // Update global auth context
        login(data.user);
        showToast('Successfully logged in', 'success');

        // Access role from the user object
        const userRole = data.user?.role;
        const isAdmin = userRole === 'ADMIN' || userRole === 'SUPER_ADMIN';

        navigate(isAdmin ? '/admin-dashboard' : '/dashboard');
      } else {
        const errorBody = await response.json();
        setErrorData({
          message: errorBody.message || 'Login failed',
          errors: errorBody.errors || [],
          status: response.status,
        });
      }
    } catch (err) {
      setErrorData({
        message: `Connection error: ${err.message}`,
        errors: [],
        status: 500,
      });
    }
  };

  return (
    <div className={`${styles.formContainer} animate-fade-in`}>
      <h2>Log In</h2>

      {/* Conditional Error Feedback */}
      {errorData.status === 401 ? (
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

        <button type="submit" className={styles.submitBtn}>
          Enter
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
