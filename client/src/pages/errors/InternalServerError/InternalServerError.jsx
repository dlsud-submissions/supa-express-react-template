import { useRouteError } from 'react-router';
import ReturnHomeButton from '../../../components/buttons/ReturnHomeButton/ReturnHomeButton';
import styles from './InternalServerError.module.css';

/**
 * Global Error Boundary page for the application.
 * - Catches uncaught JavaScript exceptions and 500 server responses.
 * - Prevents application "white screens" by providing a fallback UI.
 * - Uses ReturnHomeButton for standardized navigation.
 * @returns {JSX.Element}
 */
const InternalServerError = () => {
  const error = useRouteError();

  // Log error for developers in non-production environments
  console.error(error);

  return (
    <main className={`${styles.container} flex-center animate-fade-in`}>
      <div className={styles.content}>
        <h1 className={styles.errorCode}>500</h1>
        <h2 className={styles.title}>Something went wrong</h2>
        <p className={styles.message}>
          An unexpected error occurred. We've been notified and are working to
          fix it.
        </p>

        <ReturnHomeButton/>
      </div>
    </main>
  );
};

export default InternalServerError;
