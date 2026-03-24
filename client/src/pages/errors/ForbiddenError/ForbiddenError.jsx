import ReturnHomeButton from '../../../components/buttons/ReturnHomeButton/ReturnHomeButton';
import styles from './ForbiddenError.module.css';

/**
 * Page displayed when a user attempts to access a restricted resource.
 * - Handles 403 Forbidden scenarios.
 * - Provides navigation back to safety using ReturnHomeButton.
 * @returns {JSX.Element} The rendered error page.
 */
const ForbiddenError = () => {
  return (
    <main className={`${styles.container} flex-center animate-fade-in`}>
      <div className={styles.content}>
        <h1 className={styles.errorCode}>403</h1>
        <h2 className={styles.title}>Access Denied</h2>
        <p className={styles.message}>
          You do not have the required permissions to view this resource. Please
          contact an administrator if you believe this is an error.
        </p>
        <ReturnHomeButton />
      </div>
    </main>
  );
};

export default ForbiddenError;
