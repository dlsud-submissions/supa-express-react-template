import { createContext, useState, useContext, useCallback } from 'react';
import ToastContainer from '../../components/feedback/ToastContainer/ToastContainer.jsx';

const ToastContext = createContext(null);

/**
 * Manages the state and lifecycle of toast notifications.
 * - Provides a method to trigger new notifications.
 * - Automatically handles toast expiration and removal.
 * @param {Object} props - Component props.
 * @param {React.ReactNode} props.children - App components to wrap.
 * @returns {JSX.Element} The provider wrapper with a toast container.
 */
export const ToastProvider = ({ children }) => {
  // Initialize state for active notifications
  const [toasts, setToasts] = useState([]);

  // Create function to add toast and set expiry timer
  const showToast = useCallback((message, type = 'info') => {
    // Generate unique id for keying
    const id = Date.now();

    // Add new toast to queue
    setToasts((prev) => [...prev, { id, message, type }]);

    // Set timer to remove toast after 3 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3000);
  }, []);

  // Create function to manually remove a toast
  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Render the container at the root level of the app */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

/**
 * Hook to access the toast notification system.
 * @returns {Object} { showToast } function.
 */
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
