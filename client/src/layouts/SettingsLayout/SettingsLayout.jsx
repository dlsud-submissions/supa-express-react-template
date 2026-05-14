import { NavLink, Outlet } from 'react-router';
import styles from './SettingsLayout.module.css';

const settingsLinks = [
  { to: '/settings/profile', label: 'Profile' },
  { to: '/settings/account', label: 'Account' },
];

/**
 * Layout-scoped shell for authenticated settings pages.
 * @returns {JSX.Element}
 */
const SettingsLayout = () => {
  return (
    <section className={`${styles.settingsShell} animate-fade-in`}>
      <aside className={styles.sidebar} aria-label="Settings navigation">
        <h1 className={styles.title}>Settings</h1>
        <nav className={styles.navList}>
          {settingsLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.active : ''}`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className={styles.content}>
        <Outlet />
      </div>
    </section>
  );
};

export default SettingsLayout;
