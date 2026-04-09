import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { authApi } from '../../../modules/api/auth/auth.api.js';
import { signupSchema } from '../../../modules/validators/auth/auth.validator.js';
import ValidationError from '../../errors/ValidationError/ValidationError';
import styles from './SignupForm.module.css';

/**
 * Signup form component for user registration.
 * - Calls authApi.signup() which uses Supabase Auth directly.
 * - Navigates to /log-in on success.
 * - Handles { data, error } return shape from Supabase SDK.
 * @returns {JSX.Element} The rendered signup form.
 */
const SignupForm = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [errorData, setErrorData] = useState({ message: '', errors: [] });
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  return (
    <div className={`${styles.formContainer} animate-fade-in`}>
      <h2>Create Account</h2>

      {/* Conditional validation feedback */}
      <ValidationError message={errorData.message} errors={errorData.errors} />

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

        <button
          type="submit"
          className={styles.submitBtn}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Registering...' : 'Register'}
        </button>
      </form>

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
