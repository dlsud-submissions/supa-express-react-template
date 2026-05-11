import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { authApi } from '../../../modules/api/auth/auth.api';

const VerifyEmailPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userId, email } = location.state || {};
  const [token, setToken] = useState('');
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const res = await authApi.verifyOtp(userId, token, 'email_verification');
    if (res?.valid) {
      navigate('/setup-username', { state: { userId } });
    } else {
      setError('Invalid or expired code');
    }
  };

  const handleResend = async () => {
    setSending(true);
    await authApi.sendOtp(userId, email, 'email_verification');
    setSending(false);
  };

  if (!userId || !email) {
    return <p>Missing verification context. Please sign up again.</p>;
  }

  return (
    <main>
      <h1>Verify your email</h1>
      <p>We sent a 6-digit code to {email}</p>
      <form onSubmit={handleSubmit}>
        <label>
          Code
          <input
            value={token}
            onChange={(e) => setToken(e.target.value)}
            maxLength={6}
            inputMode="numeric"
          />
        </label>
        {error && <div role="alert">{error}</div>}
        <button type="submit">Verify</button>
      </form>
      <button onClick={handleResend} disabled={sending}>
        {sending ? 'Resending...' : 'Resend code'}
      </button>
    </main>
  );
};

export default VerifyEmailPage;
