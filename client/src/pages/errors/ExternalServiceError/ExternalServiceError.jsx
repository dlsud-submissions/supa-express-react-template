import { useNavigate } from 'react-router';
import { RefreshCw } from 'lucide-react';
import ReturnHomeButton from '../../../components/buttons/ReturnHomeButton/ReturnHomeButton';
import styles from './ExternalServiceError.module.css';

/**
 * Page component for handling external API and service failures.
 * - Triggered by ExternalServiceError (500/503) from the server.
 * - Specific to third-party integrations (Google, 2FA, etc.).
 * @returns {JSX.Element} The rendered error page.
 */
const ExternalServiceError = () => {
  const navigate = useNavigate();

  /**
   * Refreshes the current route to attempt a service reconnection.
   */
  const handleRetry = () => {
    navigate(0);
  };

  return (
    <main className={`${styles.container} flex-center animate-fade-in`}>
      <div className={styles.content}>
        <div className={styles.labelWrapper}>
          <span className={styles.errorLabel}>Connection Error</span>
        </div>

        <h1 className={styles.title}>Service Interruption</h1>

        <p className={styles.message}>
          We're having trouble connecting to one of our external providers. This
          is usually temporary. Please try again in a few moments.
        </p>

        <div className={styles.actions}>
          <button onClick={handleRetry} className={styles.retryButton}>
            <RefreshCw size={18} />
            <span>Try Again</span>
          </button>

          <ReturnHomeButton />
        </div>
      </div>
    </main>
  );
};

export default ExternalServiceError;
