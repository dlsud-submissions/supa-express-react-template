import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import ConflictError from '../../../components/errors/ConflictError/ConflictError';
import { userApi } from '../../../modules/api/user/user.api';
import { useToast } from '../../../providers/ToastProvider/ToastProvider';

const SetUsernamePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userId } = location.state || {};
  const [username, setUsername] = useState('');
  const [error, setError] = useState(null);
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const { error } = await userApi.updateUsernameById(userId, username);
      if (error) {
        // Postgres unique violation code
        if (error.code === '23505' || error.details?.includes('duplicate')) {
          setError('Username already taken');
          return;
        }
        setError(error.message || 'Update failed');
        return;
      }
      showToast('Account created — please log in', 'success');
      navigate('/log-in');
    } catch (err) {
      setError(err.message || 'Update failed');
    }
  };

  if (!userId) return <p>Missing user context. Please sign up again.</p>;

  return (
    <main>
      <h1>Choose a username</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Username
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </label>
        {error ? <ConflictError message={error} /> : null}
        <button type="submit">Save</button>
      </form>
    </main>
  );
};

export default SetUsernamePage;
