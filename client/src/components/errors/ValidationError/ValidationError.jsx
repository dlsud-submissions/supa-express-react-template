import styles from './ValidationError.module.css';

/**
 * Inline component for displaying validation failure details.
 * - Specifically handles the array of field errors from the server.
 * - Used within forms (Signup/Login) for context-aware feedback.
 * - Uses global animation classes for entry.
 * @param {Object} props - Component properties.
 * @param {string} props.message - General error summary message.
 * @param {Array} [props.errors=[]] - Optional list of specific field error objects.
 * @returns {JSX.Element | null}
 */
const ValidationError = ({ message, errors = [] }) => {
  // Return null if no error message is provided
  if (!message || message.trim() === '') return null;

  return (
    <div
      className={`${styles.container} animate-fade-in`}
      role="alert"
      aria-live="assertive"
    >
      <p className={styles.summary}>{message}</p>

      {/* Map through specific field errors if provided by the server */}
      {errors.length > 0 && (
        <ul className={styles.errorList}>
          {errors.map((err, index) => (
            <li key={index} className={styles.errorItem}>
              {err.msg || err.message}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ValidationError;
