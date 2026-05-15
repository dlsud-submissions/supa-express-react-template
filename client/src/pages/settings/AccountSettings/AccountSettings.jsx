import { useState } from 'react';
import ValidationError from '../../../components/errors/ValidationError/ValidationError';
import { authApi } from '../../../modules/api/auth/auth.api';
import { passwordChangeSchema } from '../../../modules/validators/auth/auth.validator';
import { useAuth } from '../../../providers/AuthProvider/AuthProvider';
import { useToast } from '../../../providers/ToastProvider/ToastProvider';
import styles from './AccountSettings.module.css';

const INITIAL_ERRORS = { message: '', errors: [] };

const toValidationErrors = (issues) =>
  issues.map((issue) => ({
    msg: issue.message,
  }));

const AccountSettings = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [step, setStep] = useState(1);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [token, setToken] = useState('');
  const [form, setForm] = useState({ newPassword: '', confirmPassword: '' });
  const [errorData, setErrorData] = useState(INITIAL_ERRORS);

  const sendOtp = async () => {
    if (!user?.id || !user?.email) return;
    setErrorData(INITIAL_ERRORS);
    setIsSending(true);

    try {
      const res = await authApi.sendOtp(user.id, user.email, 'password_reset');
      if (res?.error) {
        setErrorData({
          message: res.error.message || 'Unable to send code',
          errors: [],
        });
        return;
      }

      setStep(2);
    } catch (err) {
      setErrorData({
        message: err.message || 'Unable to send code',
        errors: [],
      });
    } finally {
      setIsSending(false);
    }
  };

  const verify = async (e) => {
    e?.preventDefault();
    setErrorData(INITIAL_ERRORS);
    setIsVerifying(true);

    try {
      const res = await authApi.verifyOtp(user.id, token, 'password_reset');
      if (res?.valid) {
        setStep(3);
        setToken('');
        return;
      }

      setErrorData({ message: 'Invalid or expired code', errors: [] });
    } catch (err) {
      setErrorData({
        message: err.message || 'Unable to verify code',
        errors: [],
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((cur) => ({ ...cur, [name]: value }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setErrorData(INITIAL_ERRORS);

    const payload = {
      newPassword: form.newPassword.trim(),
      confirmPassword: form.confirmPassword.trim(),
    };

    const validation = passwordChangeSchema.safeParse(payload);
    if (!validation.success) {
      setErrorData({
        message: 'Validation failed',
        errors: toValidationErrors(validation.error.issues),
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await authApi.updatePassword(
        validation.data.newPassword
      );
      if (error) {
        setErrorData({
          message: error.message || 'Unable to update password',
          errors: [],
        });
        return;
      }

      showToast('Password updated', 'success');
      // reset back to step 1
      setForm({ newPassword: '', confirmPassword: '' });
      setStep(1);
    } catch (err) {
      setErrorData({
        message: err.message || 'Unable to update password',
        errors: [],
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className={styles.panel}>
      <div className={styles.header}>
        <h2 className={styles.title}>Account</h2>
        <p className={styles.subtitle}>
          Change your password securely via email verification.
        </p>
      </div>

      <ValidationError message={errorData.message} errors={errorData.errors} />

      {step === 1 && (
        <div className={styles.step}>
          <p>
            To change your password, send a verification code to your verified
            email.
          </p>
          <button
            onClick={sendOtp}
            className={styles.primary}
            disabled={isSending}
          >
            {isSending ? 'Sending...' : 'Send verification code'}
          </button>
        </div>
      )}

      {step === 2 && (
        <form className={styles.step} onSubmit={verify} noValidate>
          <label htmlFor="token">Verification code</label>
          <input
            id="token"
            name="token"
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            inputMode="numeric"
            maxLength={6}
            autoComplete="one-time-code"
            required
          />
          <div className={styles.controls}>
            <button
              type="button"
              onClick={() => setStep(1)}
              className={styles.link}
            >
              Back
            </button>
            <button
              type="submit"
              className={styles.primary}
              disabled={isVerifying}
            >
              {isVerifying ? 'Verifying...' : 'Verify code'}
            </button>
          </div>
        </form>
      )}

      {step === 3 && (
        <form
          className={styles.step}
          onSubmit={handlePasswordSubmit}
          noValidate
        >
          <div className={styles.inputGroup}>
            <label htmlFor="newPassword">New password</label>
            <input
              id="newPassword"
              name="newPassword"
              type="password"
              value={form.newPassword}
              onChange={handleChange}
              autoComplete="new-password"
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="confirmPassword">Confirm password</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
              required
            />
          </div>

          <div className={styles.controls}>
            <button
              type="button"
              onClick={() => setStep(1)}
              className={styles.link}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.primary}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Updating...' : 'Update password'}
            </button>
          </div>
        </form>
      )}
    </section>
  );
};

export default AccountSettings;
