import styles from './Spinner.module.css';

/**
 * Reusable loading spinner with optional message.
 * @param {string} size - CSS dimension for width/height.
 * @param {string} message - Optional text to display below the spinner.
 */
const Spinner = ({ size = '2.5rem', message }) => {
  return (
    <div className={styles.spinnerWrapper} role="status">
      <div
        className={`${styles.spinner} animate-spin`}
        style={{ width: size, height: size }}
      />

      {/* If message exists, show it; otherwise, keep sr-only for screen readers */}
      {message ? (
        <p className={styles.message}>{message}</p>
      ) : (
        <span className="sr-only">Loading...</span>
      )}
    </div>
  );
};

export default Spinner;
