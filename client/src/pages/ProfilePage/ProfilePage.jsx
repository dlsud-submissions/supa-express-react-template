import { Calendar, Hash, LogIn } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { userApi } from '../../modules/api/user/user.api';
import { useAuth } from '../../providers/AuthProvider/AuthProvider';
import styles from './ProfilePage.module.css';

/**
 * User Profile Page.
 * - Displays account details for the current user or a targeted user.
 * - Consumes { data, error } from userApi (Supabase CRUD).
 * @returns {JSX.Element}
 */
const ProfilePage = () => {
  const { id } = useParams();
  const { user: currentUser } = useAuth();

  const [profileUser, setProfileUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsLoading(true);

        const { data, error: apiError } = id
          ? await userApi.getById(id)
          : await userApi.getProfile();

        if (apiError)
          throw new Error(apiError.message || 'User profile not found');

        setProfileUser(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [id, currentUser]);

  if (isLoading) return <div className={styles.loadingWrapper}>Loading...</div>;
  if (error) return <div className={styles.errorWrapper}>Error: {error}</div>;
  if (!profileUser) return null;

  return (
    <div className={`${styles.container} animate-fade-in`}>
      <div className={styles.profileCard}>
        <div className={styles.avatar}>
          {profileUser.username?.charAt(0).toUpperCase()}
        </div>

        <div className={styles.infoSection}>
          <h1 className={styles.username}>{profileUser.username}</h1>
          <span className={styles.roleBadge}>{profileUser.role}</span>
        </div>

        <div className={styles.detailsGrid}>
          <div className={styles.detailItem}>
            <div className={styles.detailIcon}>
              <Hash size={16} /> :
            </div>
            <span className={styles.detailValue}>{profileUser.id}</span>
          </div>

          <div className={styles.detailItem}>
            <div className={styles.detailIcon}>
              <Calendar size={16} /> :
            </div>
            <span className={styles.detailValue}>
              {profileUser.created_at
                ? new Date(profileUser.created_at).toLocaleDateString()
                : 'N/A'}
            </span>
          </div>

          <div className={styles.detailItem}>
            <div className={styles.detailIcon}>
              <LogIn size={16} /> :
            </div>
            <span className={styles.detailValue}>
              {profileUser.last_login
                ? new Date(profileUser.last_login).toLocaleString()
                : 'Never'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
