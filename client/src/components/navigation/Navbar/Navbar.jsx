import { useState } from 'react';
import { Link } from 'react-router';
import { Home, User, Settings, Sun, Moon, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../../../providers/AuthProvider/AuthProvider';
import { useToast } from '../../../providers/ToastProvider/ToastProvider';
import { useTheme } from '../../../providers/ThemeProvider/ThemeProvider';
import SearchBar from '../../search/SearchBar/SearchBar';
import ConfirmationModal from '../../feedback/modals/ConfirmationModal/ConfirmationModal';
import styles from './Navbar.module.css';

/**
 * Global navigation component.
 * - Manages branding and primary navigation links.
 * - Dynamic "Home" link based on user role.
 * - Profile link is visible to ALL authenticated users (not just admins).
 * - Collapses to a hamburger menu on small screens.
 * @returns {JSX.Element}
 */
const Navbar = () => {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const { theme, toggleTheme } = useTheme();

  const [showConfirm, setShowConfirm] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
  const homePath = isAdmin ? '/admin-dashboard' : '/dashboard';

  /**
   * Finalizes the logout process.
   * - Clears session data via AuthProvider.
   * - Triggers success notification.
   * - Closes the confirmation modal.
   */
  const handleConfirmLogout = async () => {
    await logout();
    showToast('Logged out successfully', 'info');
    setShowConfirm(false);
  };

  return (
    <>
      <nav className={styles.navbar}>
        {/* Left: nav links */}
        <div className={styles.navLinks}>
          <Link to={homePath} className={styles.navItem} aria-label="Home">
            <Home size={20} />
          </Link>

          {/* Profile — all authenticated users */}
          {user && (
            <Link
              to="/profile"
              className={styles.navItem}
              aria-label="View Profile"
            >
              <User size={20} />
            </Link>
          )}

          <Link
            to="/settings"
            className={styles.navItem}
            title="Account Settings"
          >
            <Settings size={20} />
          </Link>

          <button
            onClick={toggleTheme}
            className={styles.themeToggle}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>

        {/* Center: search bar — hidden on small screens */}
        <div className={styles.searchWrapper}>
          <SearchBar />
        </div>

        {/* Right: user info + logout (desktop) */}
        {user && (
          <div className={styles.userSection}>
            <div className={styles.info}>
              <span className={styles.username}>{user.username}</span>
              <span className={styles.roleLabel}>{user.role}</span>
            </div>
            <button
              onClick={() => setShowConfirm(true)}
              className={styles.logoutBtn}
              aria-label="Log out"
            >
              <LogOut size={18} />
            </button>
          </div>
        )}

        {/* Mobile: hamburger */}
        <button
          className={styles.hamburger}
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* Mobile dropdown panel */}
      {menuOpen && (
        <div className={styles.mobileMenu}>
          <SearchBar />
          {user && (
            <div className={styles.mobileUser}>
              <span className={styles.username}>{user.username}</span>
              <span className={styles.roleLabel}>{user.role}</span>
              <button
                onClick={() => {
                  setShowConfirm(true);
                  setMenuOpen(false);
                }}
                className={styles.logoutBtn}
                aria-label="Log out"
              >
                <LogOut size={18} />
                <span>Log out</span>
              </button>
            </div>
          )}
        </div>
      )}

      <ConfirmationModal
        isOpen={showConfirm}
        onConfirm={handleConfirmLogout}
        onCancel={() => setShowConfirm(false)}
        title="Confirm Logout"
        message="Are you sure you want to log out of your session?"
        confirmLabel="Logout"
      />
    </>
  );
};

export default Navbar;
