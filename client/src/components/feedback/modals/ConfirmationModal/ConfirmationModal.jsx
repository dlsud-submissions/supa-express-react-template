import { createPortal } from 'react-dom';
import styles from './ConfirmationModal.module.css';

/**
 * Reusable confirmation modal for destructive or sensitive actions.
 * - Controlled entirely by parent via isOpen prop.
 * - Delegates confirm/cancel outcomes to parent callbacks.
 * - Closes on overlay click via onCancel.
 * - Renders via portal to document.body to avoid stacking context issues.
 * @param {Object} props
 * @param {boolean} props.isOpen - Controls visibility of the modal.
 * @param {function} props.onConfirm - Called when the user confirms the action.
 * @param {function} props.onCancel - Called when the user cancels or clicks the overlay.
 * @param {string} props.title - Heading text displayed in the modal.
 * @param {string} props.message - Body text describing the action.
 * @param {string} [props.confirmLabel='Confirm'] - Label for the confirm button.
 * @param {string} [props.cancelLabel='Cancel'] - Label for the cancel button.
 * @returns {JSX.Element|null}
 */
const ConfirmationModal = ({
  isOpen,
  onConfirm,
  onCancel,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
}) => {
  if (!isOpen) return null;

  return createPortal(
    <div
      className={`${styles.modalOverlay} animate-fade-in`}
      onClick={onCancel}
    >
      <div
        className={`${styles.modalContent} animate-slide-up`}
        onClick={(e) => e.stopPropagation()}
      >
        <h3>{title}</h3>
        <p>{message}</p>
        <div className={styles.modalActions}>
          <button className={styles.cancelBtn} onClick={onCancel}>
            {cancelLabel}
          </button>
          <button className={styles.confirmBtn} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ConfirmationModal;
