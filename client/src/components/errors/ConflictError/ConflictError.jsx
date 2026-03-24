import styles from './ConflictError.module.css';

/**
 * Inline component for displaying resource conflict feedback.
 * - Handles 409 responses from the backend (e.g., duplicate username).
 * - Displays using the standard red error palette and global animations.
 * @param {Object} props - Component properties.
 * @param {string} props.message - The conflict message string from the server.
 * @returns {JSX.Element | null}
 */
const ConflictError = ({ message }) => {
  // Return null early if no message string is provided
  if (!message || message.trim() === '') return null;

  return (
    <div
      className={`${styles.container} animate-fade-in`}
      role="alert"
      aria-live="assertive"
    >
      <span className={styles.label}>Error:</span>
      <p className={styles.message}>{message}</p>
    </div>
  );
};

export default ConflictError;
