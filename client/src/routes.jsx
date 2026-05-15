import { createBrowserRouter, Navigate } from 'react-router';
import LoginForm from './components/forms/LoginForm/LoginForm';
import MainLayout from './layouts/MainLayout/MainLayout';
import SettingsLayout from './layouts/SettingsLayout/SettingsLayout';
import AdminDashboard from './pages/admin/AdminDashboard/AdminDashboard';
import UserManagementPage from './pages/admin/UserManagementPage/UserManagementPage';
import App from './pages/App/App';
import CompleteProfile from './pages/auth/CompleteProfile/CompleteProfile';
import OAuthCallback from './pages/auth/OAuthCallback/OAuthCallback';
import SetUsernamePage from './pages/auth/SetUsernamePage/SetUsernamePage';
import SignupPage from './pages/auth/SignupPage/SignupPage';
import VerifyEmailPage from './pages/auth/VerifyEmailPage/VerifyEmailPage';
import ExternalServiceError from './pages/errors/ExternalServiceError/ExternalServiceError';
import ForbiddenError from './pages/errors/ForbiddenError/ForbiddenError';
import InternalServerError from './pages/errors/InternalServerError/InternalServerError';
import NotFoundError from './pages/errors/NotFoundError/NotFoundError';
import LandingPage from './pages/LandingPage/LandingPage';
import ProfilePage from './pages/ProfilePage/ProfilePage';
import SearchPage from './pages/SearchPage/SearchPage';
import AccountSettings from './pages/settings/AccountSettings/AccountSettings';
import ProfileSettings from './pages/settings/ProfileSettings/ProfileSettings';
import UserDashboard from './pages/user/UserDashboard/UserDashboard';
import { AuthProvider } from './providers/AuthProvider/AuthProvider';
import { ThemeProvider } from './providers/ThemeProvider/ThemeProvider';
import { ToastProvider } from './providers/ToastProvider/ToastProvider';
import AdminRoute from './routes/AdminRoute/AdminRoute';
import AuthRoute from './routes/AuthRoute/AuthRoute';

/**
 * Global application router configuration.
 * - Public: Standalone pages like Landing, Login, Signup, and OAuthCallback.
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
        element: <SignupPage />,
      },
      {
        path: 'verify-email',
        element: <VerifyEmailPage />,
      },
      {
        path: 'setup-username',
        element: <SetUsernamePage />,
      },
      {
        path: 'log-in',
        element: <LoginForm />,
      },
      // OAuth callback — public, handles Supabase code exchange on mount
      {
        path: 'auth/callback',
        element: <OAuthCallback />,
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
                path: 'complete-profile',
                element: <CompleteProfile />,
              },
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
              {
                path: 'settings',
                element: <SettingsLayout />,
                children: [
                  {
                    index: true,
                    element: <Navigate to="/settings/profile" replace />,
                  },
                  {
                    path: 'profile',
                    element: <ProfileSettings />,
                  },
                  {
                    path: 'account',
                    element: <AccountSettings />,
                  },
                ],
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
