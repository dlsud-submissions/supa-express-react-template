import { createContext, useState, useEffect, useContext } from 'react';
import { authApi } from '../../modules/api/auth/auth.api.js';
import { useToast } from '../ToastProvider/ToastProvider';

const AuthContext = createContext(null);

/**
 * Provider component for authentication state and actions.
 * - Manages the 'user' object, 'loading' status, and global 'authError'.
 * - Syncs auth state with the backend on mount.
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @returns {JSX.Element}
 */
export const AuthProvider = ({ children }) => {
  // Access toast system for notifications
  const { showToast } = useToast();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  /**
   * Pings the server to verify if a valid session cookie exists.
   * - Clears error on success.
   * - Sets error message and triggers toast on 401/failure.
   */
  const checkAuthStatus = async () => {
    try {
      const response = await authApi.checkStatus();

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setAuthError(null);
      } else if (response.status === 401) {
        setUser(null);
        // Apply session expiration message for test compliance
        const msg = 'Your session has expired. Please log in again.';
        setAuthError(msg);
        showToast(msg, 'error');
      }
    } catch (err) {
      setUser(null);
      setAuthError('Unable to connect to authentication server.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Updates global state after successful login.
   * @param {Object} userData
   */
  const login = (userData) => {
    setUser(userData);
    setAuthError(null);
  };

  /**
   * Resets global state after logout.
   */
  const logout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.error('Remote logout failed, clearing local state only:', err);
    } finally {
      setUser(null);
      setAuthError(null);
    }
  };

  /**
   * Manually clear the global auth error.
   */
  const clearAuthError = () => {
    setAuthError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        authError,
        login,
        logout,
        clearAuthError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to access authentication context.
 * @returns {Object} { user, loading, authError, login, logout, clearAuthError }
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
