import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { AuthProvider } from '../../../providers/AuthProvider/AuthProvider';
import { ToastProvider } from '../../../providers/ToastProvider/ToastProvider';
import { ThemeProvider } from '../../../providers/ThemeProvider/ThemeProvider';

/**
 * A wrapper component that provides all global application contexts.
 * - Includes ThemeProvider for styling context
 * - Includes ToastProvider for notification management
 * - Includes AuthProvider for session and user state
 * - Includes MemoryRouter to support navigation hooks
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - The component under test
 * @returns {JSX.Element} The component wrapped in all necessary providers
 */
const AllTheProviders = ({ children, initialEntries = ['/'] }) => (
  <MemoryRouter initialEntries={initialEntries}>
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>{children}</AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  </MemoryRouter>
);

/**
 * Custom render function that wraps UI components with global providers.
 * @param {React.ReactElement} ui - The component to render
 * @param {Object} [options] - Standard React Testing Library render options
 * @returns {Object} The standard RTL render result with providers applied
 */
const customRender = (ui, { initialEntries, ...options } = {}) => {
  return render(ui, {
    wrapper: (props) => (
      <AllTheProviders {...props} initialEntries={initialEntries} />
    ),
    ...options,
  });
};

// Re-export everything from RTL
// eslint-disable-next-line react-refresh/only-export-components
export * from '@testing-library/react';

// Override the standard render with our custom version
export { customRender as render };
