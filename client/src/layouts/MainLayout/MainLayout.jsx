import { Outlet } from 'react-router';
import Navbar from '../../components/navigation/Navbar/Navbar';
import styles from './MainLayout.module.css';

/**
 * Primary layout wrapper for the application.
 * - Provides a persistent global navigation header.
 * - Manages the main content area using the Router Outlet.
 * - Handles top-level layout constraints (min-height, background).
 * @returns {JSX.Element} The rendered structural layout.
 */
const MainLayout = () => {
  return (
    // Wrap application in a flex container for full height coverage
    <div className={styles.layoutContainer}>
      <Navbar />

      {/* Render the inner page content within a centered global container */}
      <main className={`${styles.mainContent} container`}>
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
