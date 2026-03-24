import { useAuth } from '../../../providers/AuthProvider/AuthProvider';
import styles from './UserDashboard.module.css';

/**
 * Standard User Dashboard.
 * - Displays a personalized welcome message.
 * - Includes a placeholder area for future user-specific features.
 * @returns {JSX.Element}
 */
const UserDashboard = () => {
  const { user } = useAuth();

  return (
    <div className={`${styles.container} animate-fade-in`}>
      <div className={styles.welcomeCard}>
        <h1 className={styles.title}>Welcome back, {user?.username}!</h1>
        <p className={styles.subtitle}>
          This is your personal dashboard. Soon you will be able to see your
          recent activity and account statistics here.
        </p>
      </div>

      <div className={styles.placeholderSection}>
        <p>User-specific content coming soon...</p>
      </div>
    </div>
  );
};

export default UserDashboard;
