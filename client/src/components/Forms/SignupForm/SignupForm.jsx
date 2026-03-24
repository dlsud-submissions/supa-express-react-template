import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { signupSchema } from '../../../modules/validators/auth/auth.validator.js';
import { authApi } from '../../../modules/api/auth/auth.api.js';
import ValidationError from '../../errors/ValidationError/ValidationError';
import styles from './SignupForm.module.css';

/**
 * Signup form component for user registration.
 * - Manages local form state for username, password, and confirmation.
 * - Uses authApi service for network requests.
 * @returns {JSX.Element} The rendered signup form.
 */
const SignupForm = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [errorData, setErrorData] = useState({ message: '', errors: [] });
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
   * Processes the signup submission, validation, and API registration.
   * @param {React.FormEvent} e
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorData({ message: '', errors: [] });

    // Validate form data against Zod schema
    const validation = signupSchema.safeParse(formData);

    // Set client-side validation error if schema check fails
    if (!validation.success) {
      setErrorData({
        message: 'Validation failed',
        errors: validation.error.issues.map((issue) => ({
          msg: issue.message,
        })),
      });
      return;
    }

    try {
      // Execute registration request
      const response = await authApi.signup(formData);

      if (response.ok) {
        navigate('/log-in');
      } else {
        const errorBody = await response.json();
        setErrorData({
          message: errorBody.message || 'Signup failed',
          errors: errorBody.errors || [],
        });
      }
    } catch (err) {
      // Handle Unexpected Network Errors
      setErrorData({
        message: `An error occurred: ${err.message}`,
        errors: [],
      });
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

        <button type="submit" className={styles.submitBtn}>
          Register
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
