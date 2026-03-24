import styles from './Toast.module.css';

/**
 * Individual toast notification component.
 * - Displays a message with semantic styling (success, error, info).
 * - Utilizes global animation classes for entry.
 * @param {Object} props - Component properties.
 * @param {string} props.message - Text to display within the toast.
 * @param {'success'|'error'|'info'} [props.type='info'] - Semantic style variant.
 * @param {function} props.onClose - Callback triggered when the close button is clicked.
 * @returns {JSX.Element}
 */
const Toast = ({ message, type = 'info', onClose }) => {
  // Apply variant styles based on type
  const toastClass = `${styles.toast} ${styles[type]} animate-slide-up`;

  return (
    <div className={toastClass} role="alert">
      <span className={styles.message}>{message}</span>
      <button
        className={styles.closeButton}
        onClick={onClose}
        aria-label="Close notification"
      >
        &times;
      </button>
    </div>
  );
};

export default Toast;