import { Link, Navigate } from 'react-router';
import { useAuth } from '../../providers/AuthProvider/AuthProvider';
import styles from './LandingPage.module.css';

/**
 * Public landing page component.
 * - Serves as the entry point for unauthenticated users.
 * - Redirects authenticated users to their respective dashboards.
 * @returns {JSX.Element} The rendered landing page.
 */
const LandingPage = () => {
  const { user } = useAuth();

  // Redirect authenticated users away from landing
  if (user) {
    // Include SUPER_ADMIN in the admin redirect check
    const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';
    const destination = isAdmin ? '/admin-dashboard' : '/dashboard';
    return <Navigate to={destination} replace />;
  }

  return (
    <div className={`${styles.container} animate-fade-in`}>
      <section className={`${styles.hero} flex-center`}>
        <h1 className={styles.title}>Welcome to the App</h1>
        <p className={styles.description}>
          Experience the next generation of productivity. Our platform provides
          seamless integration and powerful tools to help you scale your
          workflow efficiently.
        </p>

        {/* Call to Action */}
        <div className={styles.ctaGroup}>
          <Link to="/sign-up" className={styles.primaryButton}>
            Get Started
          </Link>
          <Link to="/log-in" className={styles.secondaryButton}>
            Log In
          </Link>
        </div>
      </section>

      {/* Features Content */}
      <section className={styles.features}>
        <div className={styles.featureCard}>
          <h3>Seamless Integration</h3>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
        </div>
        <div className={styles.featureCard}>
          <h3>Secure by Default</h3>
          <p>
            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris
            nisi ut aliquip ex ea commodo consequat.
          </p>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
