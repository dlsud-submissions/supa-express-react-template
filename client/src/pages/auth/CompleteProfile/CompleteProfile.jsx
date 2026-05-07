import { useState } from 'react';
import ConflictError from '../../../components/errors/ConflictError/ConflictError';
import ValidationError from '../../../components/errors/ValidationError/ValidationError';
import { userApi } from '../../../modules/api/user/user.api';
import { usernameSchema } from '../../../modules/validators/auth/auth.validator.js';
import { useAuth } from '../../../providers/AuthProvider/AuthProvider';
import { useToast } from '../../../providers/ToastProvider/ToastProvider';
import styles from './CompleteProfile.module.css';

/**
 * Username completion page for first-time Google OAuth users.
 * - Prompts users to replace the auto-generated username before entering the app.
 * - Uses the same username validation rules as the signup form.
 * @returns {JSX.Element}
 */
const CompleteProfile = () => {
  const { user, clearNeedsUsername } = useAuth();
  const { showToast } = useToast();
  const [username, setUsername] = useState(user?.username || '');
  const [errorData, setErrorData] = useState({ message: '', errors: [] });
  const [conflictMessage, setConflictMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const destination =
    user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN'
      ? '/admin-dashboard'
      : '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorData({ message: '', errors: [] });
    setConflictMessage('');

    const validation = usernameSchema.safeParse({ username });

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
      const { data, error } = await userApi.updateUsername(username);

      if (error) {
        if (error.code === '23505') {
          setConflictMessage(
            'That username is already taken. Please choose another.'
          );
          return;
        }

        setErrorData({
          message: error.message || 'Unable to save username',
          errors: [],
        });
        return;
      }

      clearNeedsUsername();
      showToast('Username updated successfully', 'success');
      window.location.assign(destination);
    } catch (err) {
      setErrorData({
        message: err.message || 'Unable to save username',
        errors: [],
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className={`${styles.page} animate-fade-in`}>
      <section className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>Complete your profile</h1>
          <p className={styles.subtitle}>
            Choose the username you want other people in the app to see.
          </p>
        </div>

        <ConflictError message={conflictMessage} />
        <ValidationError
          message={errorData.message}
          errors={errorData.errors}
        />

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.inputGroup}>
            <label htmlFor="username">Username</label>
            <input
              id="username"
              name="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
          </div>

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save username'}
          </button>
        </form>
      </section>
    </main>
  );
};

export default CompleteProfile;
