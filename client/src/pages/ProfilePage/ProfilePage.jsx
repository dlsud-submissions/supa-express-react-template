import { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import { Hash, Calendar, LogIn } from 'lucide-react';
import { useAuth } from '../../providers/AuthProvider/AuthProvider';
import { userApi } from '../../modules/api/user/user.api';
import styles from './ProfilePage.module.css';

/**
 * User Profile Page.
 * - Displays account details for the current user or a targeted user.
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
        const response = id
          ? await userApi.getById(id)
          : await userApi.getProfile();

        if (!response.ok) throw new Error('User profile not found');

        const data = await response.json();
        setProfileUser(data.user || data);
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
          {/* User ID */}
          <div className={styles.detailItem}>
            <div className={styles.detailIcon}>
              <Hash size={16} /> :
            </div>
            <span className={styles.detailValue}>{profileUser.id}</span>
          </div>

          {/* Join Date */}
          <div className={styles.detailItem}>
            <div className={styles.detailIcon}>
              <Calendar size={16} /> :
            </div>
            <span className={styles.detailValue}>
              {profileUser.createdAt
                ? new Date(profileUser.createdAt).toLocaleDateString()
                : 'N/A'}
            </span>
          </div>

          {/* Last Login */}
          <div className={styles.detailItem}>
            <div className={styles.detailIcon}>
              <LogIn size={16} /> :
            </div>
            <span className={styles.detailValue}>
              {profileUser.lastLogin
                ? new Date(profileUser.lastLogin).toLocaleString()
                : 'Never'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
