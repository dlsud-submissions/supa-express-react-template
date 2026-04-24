import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase.js';
import { authApi } from '../../modules/api/auth/auth.api.js';
import { userApi } from '../../modules/api/user/user.api.js';

const AuthContext = createContext(null);

/**
 * Provider component for authentication state and actions.
 * - Subscribes to Supabase onAuthStateChange for real-time session sync.
 * - On SIGNED_IN: fetches the user's public.users profile via userApi.getById.
 * - On SIGNED_OUT: clears all user state.
 * - Rehydrates session from localStorage on mount via authApi.checkStatus.
 * - Delegates login/logout to authApi; profile fetch to userApi.
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @returns {JSX.Element}
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    // Rehydrate session on mount via authApi.checkStatus
    authApi.checkStatus().then(({ data: { session } }) => {
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Subscribe to auth state changes — onAuthStateChange has no api-layer
    // equivalent and is intentionally kept as a provider-level lifecycle concern
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await fetchProfile(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setAuthError(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  /**
   * Fetches the user's row from public.users via userApi.getById.
   * @param {string} userId - The auth.users UUID.
   */
  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await userApi.getById(userId);

      if (error) throw error;

      setUser(data);
      setAuthError(null);
    } catch (err) {
      setUser(null);
      setAuthError('Failed to load user profile.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Signs in via authApi.login.
   * - onAuthStateChange handles setting user state after success.
   * @param {Object} credentials - { username, password }
   * @returns {Promise<{ error }>}
   */
  const login = async ({ username, password }) => {
    setAuthError(null);
    const { error } = await authApi.login({ username, password });
    if (error) setAuthError(error.message);
    return { error };
  };

  /**
   * Signs out via authApi.logout.
   * - onAuthStateChange handles clearing user state after success.
   */
  const logout = async () => {
    await authApi.logout();
  };

  /**
   * Manually clears the global auth error.
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
 * @returns {{ user, loading, authError, login, logout, clearAuthError }}
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
