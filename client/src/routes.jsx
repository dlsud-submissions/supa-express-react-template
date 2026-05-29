import { createBrowserRouter } from 'react-router';
import LoginForm from './components/forms/LoginForm/LoginForm';
import SignupForm from './components/forms/SignupForm/SignupForm';
import MainLayout from './layouts/MainLayout/MainLayout';
import App from './pages/App/App';
import LandingPage from './pages/LandingPage/LandingPage';
import ProfilePage from './pages/ProfilePage/ProfilePage';
import SearchPage from './pages/SearchPage/SearchPage';
import AdminDashboard from './pages/admin/AdminDashboard/AdminDashboard';
import UserManagementPage from './pages/admin/UserManagementPage/UserManagementPage';
import ExternalServiceError from './pages/errors/ExternalServiceError/ExternalServiceError';
import ForbiddenError from './pages/errors/ForbiddenError/ForbiddenError';
import InternalServerError from './pages/errors/InternalServerError/InternalServerError';
import NotFoundError from './pages/errors/NotFoundError/NotFoundError';
import UserDashboard from './pages/user/UserDashboard/UserDashboard';
import { AuthProvider } from './providers/AuthProvider/AuthProvider';
import { ThemeProvider } from './providers/ThemeProvider/ThemeProvider';
import { ToastProvider } from './providers/ToastProvider/ToastProvider';
import AdminRoute from './routes/AdminRoute/AdminRoute';
import AuthRoute from './routes/AuthRoute/AuthRoute';

/**
 * Global application router configuration.
 * - Public: Standalone pages like Landing, Login, and Signup.
 * - Private: Authenticated routes wrapped in MainLayout (Navbar/Sidebar).
 * - Admin: Role-gated routes nested within Auth protection.
 * @returns {Object} A React Router instance.
 */
const routes = createBrowserRouter([
  {
    path: '/',
    element: (
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    ),
    errorElement: <InternalServerError />,
    children: [
      // Standalone public entry points
      {
        index: true,
        element: <LandingPage />,
      },
      {
        path: 'sign-up',
        element: <SignupForm />,
      },
      {
        path: 'log-in',
        element: <LoginForm />,
      },

      // Authenticated Application Shell
      {
        element: <MainLayout />,
        children: [
          // Tier 1: General Authentication Protection
          {
            element: <AuthRoute />,
            children: [
              // Default landing for standard users
              {
                path: 'dashboard',
                element: <UserDashboard />,
              },
              { path: 'search', element: <SearchPage /> },
              {
                path: 'profile',
                element: <ProfilePage />,
              },
              // Admin-specific profile view for individual user management
              {
                path: 'profile/:id',
                element: <ProfilePage />,
              },

              // Tier 2: Administrative Role Protection
              {
                path: 'admin-dashboard',
                element: <AdminRoute />,
                children: [
                  {
                    index: true,
                    element: <AdminDashboard />,
                  },
                  {
                    path: 'users',
                    element: <UserManagementPage />,
                  },
                ],
              },
            ],
          },
        ],
      },

      // Error and Fallback Routing
      {
        path: 'forbidden',
        element: <ForbiddenError />,
      },
      {
        path: 'service-error',
        element: <ExternalServiceError />,
      },
      {
        path: '*',
        element: <NotFoundError />,
      },
    ],
  },
]);

export default routes;
