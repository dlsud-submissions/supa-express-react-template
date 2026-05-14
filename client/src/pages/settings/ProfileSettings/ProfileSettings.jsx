import { useEffect, useState } from 'react';
import ConflictError from '../../../components/errors/ConflictError/ConflictError';
import ValidationError from '../../../components/errors/ValidationError/ValidationError';
import { userApi } from '../../../modules/api/user/user.api';
import { profileSettingsSchema } from '../../../modules/validators/auth/auth.validator';
import { useToast } from '../../../providers/ToastProvider/ToastProvider';
import styles from './ProfileSettings.module.css';

const INITIAL_ERRORS = { message: '', errors: [] };

const toValidationErrors = (issues) =>
  issues.map((issue) => ({
    msg: issue.message,
  }));

/**
 * Settings page for editing username and avatar URL.
 * @returns {JSX.Element}
 */
const ProfileSettings = () => {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({ username: '', avatar_url: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorData, setErrorData] = useState(INITIAL_ERRORS);
  const [conflictMessage, setConflictMessage] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data, error } = await userApi.getProfile();

        if (error) {
          setErrorData({
            message: error.message || 'Unable to load profile settings',
            errors: [],
          });
          return;
        }

        setFormData({
          username: data?.username || '',
          avatar_url: data?.avatar_url || '',
        });
      } catch (err) {
        setErrorData({
          message: err.message || 'Unable to load profile settings',
          errors: [],
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorData(INITIAL_ERRORS);
    setConflictMessage('');

    const payload = {
      username: formData.username.trim(),
      avatar_url: formData.avatar_url.trim(),
    };
    const validation = profileSettingsSchema.safeParse(payload);

    if (!validation.success) {
      setErrorData({
        message: 'Validation failed',
        errors: toValidationErrors(validation.error.issues),
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await userApi.updateProfile({
        username: validation.data.username,
        avatar_url: validation.data.avatar_url || null,
      });

      if (error) {
        if (error.code === '23505' || error.details?.includes('duplicate')) {
          setConflictMessage(
            'That username is already taken. Please choose another.'
          );
          return;
        }

        setErrorData({
          message: error.message || 'Unable to save profile settings',
          errors: [],
        });
        return;
      }

      setFormData({
        username: data?.username || validation.data.username,
        avatar_url: data?.avatar_url || '',
      });
      showToast('Profile settings saved', 'success');
    } catch (err) {
      setErrorData({
        message: err.message || 'Unable to save profile settings',
        errors: [],
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className={styles.status}>Loading profile settings...</div>;
  }

  return (
    <section className={styles.panel}>
      <div className={styles.header}>
        <h2 className={styles.title}>Profile</h2>
        <p className={styles.subtitle}>
          Update the public username and avatar shown on your profile.
        </p>
      </div>

      <ConflictError message={conflictMessage} />
      <ValidationError message={errorData.message} errors={errorData.errors} />

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <div className={styles.inputGroup}>
          <label htmlFor="username">Username</label>
          <input
            id="username"
            name="username"
            type="text"
            value={formData.username}
            onChange={handleChange}
            autoComplete="username"
            required
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="avatar_url">Avatar URL</label>
          <input
            id="avatar_url"
            name="avatar_url"
            type="text"
            value={formData.avatar_url}
            onChange={handleChange}
            inputMode="url"
          />
        </div>

        <button
          type="submit"
          className={styles.submitBtn}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : 'Save profile'}
        </button>
      </form>
    </section>
  );
};

export default ProfileSettings;
