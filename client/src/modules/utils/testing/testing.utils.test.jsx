import { describe, it, expect, vi } from 'vitest';
import { render as rtlRender, screen } from '@testing-library/react';
import { render } from './testing.utils';

// Mock providers to verify the wrapper includes them
vi.mock('../../../providers/AuthProvider/AuthProvider', () => ({
  AuthProvider: ({ children }) => <div data-testid="auth-p">{children}</div>,
  useAuth: vi.fn(),
}));

vi.mock('../../../providers/ToastProvider/ToastProvider', () => ({
  ToastProvider: ({ children }) => <div data-testid="toast-p">{children}</div>,
}));

vi.mock('../../../providers/ThemeProvider/ThemeProvider', () => ({
  ThemeProvider: ({ children }) => <div data-testid="theme-p">{children}</div>,
}));

/**
 * Unit tests for the custom testing utility.
 * - Verifies that the custom render correctly wraps components in global providers.
 */
describe('Testing Utilities', () => {
  it('custom render should wrap the UI with all global providers', () => {
    // --- Arrange ---
    // Define a simple test component
    const TestComponent = () => <div>Target Content</div>;

    // --- Act ---
    // Execute custom render
    render(<TestComponent />);

    // --- Assert ---
    // Check for the existence of the content and all provider wrappers
    expect(screen.getByText('Target Content')).toBeInTheDocument();
    expect(screen.getByTestId('auth-p')).toBeInTheDocument();
    expect(screen.getByTestId('toast-p')).toBeInTheDocument();
    expect(screen.getByTestId('theme-p')).toBeInTheDocument();
  });

  it('custom render should support initialEntries for the router', () => {
    // --- Arrange ---
    // Define component that would react to routing context if needed
    const TestComponent = () => <div>Route Test</div>;

    // --- Act ---
    // Render with specific initial path
    const { container } = render(<TestComponent />, { initialEntries: ['/test-path'] });

    // --- Assert ---
    // Verify standard rendering still occurs with options passed
    expect(container).toBeInTheDocument();
  });
});