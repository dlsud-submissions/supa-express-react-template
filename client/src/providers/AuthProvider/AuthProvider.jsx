import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase.js';

const AuthContext = createContext(null);

/**
 * Provider component for authentication state and actions.
 * - Subscribes to Supabase onAuthStateChange for real-time session sync.
 * - On SIGNED_IN: fetches the user's public.users profile row for role data.
 * - On SIGNED_OUT: clears all user state.
 * - Rehydrates session from localStorage on mount via getSession().
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @returns {JSX.Element}
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    // Rehydrate session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Subscribe to auth state changes
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
   * Fetches the user's row from public.users to get username and role.
   * @param {string} userId - The auth.users UUID.
   */
  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(
          'id, username, email, role, avatar_url, provider, username_confirmed, created_at, last_login'
        )
        .eq('id', userId)
        .single();

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
   * Signs in via Supabase Auth.
   * - onAuthStateChange handles setting user state after success.
   * @param {Object} credentials - { username, password }
   * @returns {Promise<{ error }>}
   */
  const login = async ({ username, password }) => {
    setAuthError(null);
    const { error } = await supabase.auth.signInWithPassword({
      email: `${username}@app.local`,
      password,
    });
    if (error) setAuthError(error.message);
    return { error };
  };

  /**
   * Initiates Google OAuth sign-in via Supabase Auth.
   * - Redirects the browser to Google's consent screen.
   * - On return, Supabase exchanges the code and fires onAuthStateChange.
   * @returns {Promise<{ error }>}
   */
  const loginWithGoogle = async () => {
    setAuthError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setAuthError(error.message);
    }
    return { error };
  };

  /**
   * Signs out via Supabase Auth.
   * - onAuthStateChange handles clearing user state after success.
   * - Also clears the local user state as a fallback if the event never fires.
   */
  const logout = async () => {
    setAuthError(null);

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        setAuthError(error.message ?? 'Logout failed.');
        return { error };
      }

      setUser(null);
      setLoading(false);
      return { error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Logout failed.');
      setAuthError(error.message);
      return { error };
    }
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
        loginWithGoogle,
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
 * @returns {{ user, loading, authError, login, loginWithGoogle, logout, clearAuthError }}
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
