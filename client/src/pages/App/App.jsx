import { Outlet } from 'react-router';
import { useAuth } from '../../providers/AuthProvider/AuthProvider';
import Spinner from '../../components/feedback/Spinner/Spinner';
import styles from './App.module.css';
import '../../styles/index.css';

/**
 * Main Application Layout.
 * - Acts as the root wrapper for all routed pages.
 * - Blocks rendering until authentication sync is complete.
 * - Provides a centered global container for main content.
 * @returns {JSX.Element} The base application layout.
 */
function App() {
  const { loading } = useAuth();

  // Block rendering during session initialization
  if (loading) {
    return (
      <div className={`${styles.loadingContainer} animate-fade-in`}>
        <Spinner size="3rem" message="Initializing session..." />
      </div>
    );
  }

  return (
    <div className={styles.appContainer}>
      {/* Use global container class for responsive centering */}
      <main className="container">
        <Outlet />
      </main>
    </div>
  );
}

export default App;
