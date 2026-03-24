import Toast from '../Toast/Toast';
import styles from './ToastContainer.module.css';

/**
 * Orchestrates the display of multiple toast notifications.
 * - Manages the fixed position stack for notifications.
 * - Maps active toast data to individual Toast components.
 * - Enables/disables pointer events for background interaction.
 * @param {Object} props - Component properties.
 * @param {Array} props.toasts - Array of toast objects { id, message, type }.
 * @param {function} props.removeToast - Function to remove a toast by ID.
 * @returns {JSX.Element}
 */
const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className={styles.container}>
      {/* Iterate through active notifications and render individual toasts */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};

export default ToastContainer;
