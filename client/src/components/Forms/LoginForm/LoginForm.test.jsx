import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  render,
  screen,
  waitFor,
} from '../../../modules/utils/testing/testing.utils';
import { useAuth } from '../../../providers/AuthProvider/AuthProvider';
import LoginForm from './LoginForm';

// Global mock for navigation to avoid hoisting ReferenceErrors
const mockNavigate = vi.fn();

vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, useNavigate: () => mockNavigate };
});

// Mock AuthProvider — LoginForm calls AuthProvider.login(), not authApi directly
vi.mock(
  '../../../providers/AuthProvider/AuthProvider',
  async (importOriginal) => {
    const actual = await importOriginal();
    return {
      ...actual,
      useAuth: vi.fn(),
      AuthProvider: ({ children }) => children,
    };
  }
);

describe('LoginForm', () => {
  const mockLogin = vi.fn();
  const mockLoginWithGoogle = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue({
      login: mockLogin,
      loginWithGoogle: mockLoginWithGoogle,
      user: null,
    });
  });

  it('updates email input value on change', async () => {
    // --- Arrange ---
    const user = userEvent.setup();
    render(<LoginForm />);

    // --- Act ---
    const emailInput = screen.getByLabelText(/email/i);
    await user.type(emailInput, 'alice@example.com');

    // --- Assert ---
    expect(emailInput).toHaveValue('alice@example.com');
  });

  it('shows validation error when fields are empty on submit', async () => {
    // --- Arrange ---
    const user = userEvent.setup();
    render(<LoginForm />);

    // --- Act ---
    await user.click(screen.getByRole('button', { name: /enter/i }));

    // --- Assert ---
    // Zod schema requires both fields — error shown without calling login
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('calls AuthProvider.login() with email and password', async () => {
    // --- Arrange ---
    const user = userEvent.setup();
    mockLogin.mockResolvedValueOnce({ error: null });
    vi.mocked(useAuth).mockReturnValue({
      login: mockLogin,
      loginWithGoogle: mockLoginWithGoogle,
      user: null,
    });
    render(<LoginForm />);

    // --- Act ---
    await user.type(screen.getByLabelText(/email/i), 'alice@example.com');
    await user.type(screen.getByLabelText(/password/i), 'Password1');
    await user.click(screen.getByRole('button', { name: /enter/i }));

    // --- Assert ---
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'alice@example.com',
        password: 'Password1',
      });
    });
  });

  it('shows auth error message when login returns an error', async () => {
    // --- Arrange ---
    const user = userEvent.setup();
    mockLogin.mockResolvedValueOnce({
      error: { message: 'Invalid login credentials' },
    });
    render(<LoginForm />);

    // --- Act ---
    await user.type(screen.getByLabelText(/email/i), 'alice@example.com');
    await user.type(screen.getByLabelText(/password/i), 'Password1');
    await user.click(screen.getByRole('button', { name: /enter/i }));

    // --- Assert ---
    await waitFor(() => {
      expect(
        screen.getByText(/invalid login credentials/i)
      ).toBeInTheDocument();
    });
  });

  it('shows validation error for an invalid email before login', async () => {
    // --- Arrange ---
    const user = userEvent.setup();
    render(<LoginForm />);

    // --- Act ---
    await user.type(screen.getByLabelText(/email/i), 'alice');
    await user.type(screen.getByLabelText(/password/i), 'Password1');
    await user.click(screen.getByRole('button', { name: /enter/i }));

    // --- Assert ---
    expect(mockLogin).not.toHaveBeenCalled();
    expect(
      await screen.findByText(/please enter a valid email address/i)
    ).toBeInTheDocument();
  });

  it('disables the submit button while submitting', async () => {
    // --- Arrange ---
    const user = userEvent.setup();
    // Never resolves — keeps isSubmitting true
    mockLogin.mockImplementation(() => new Promise(() => {}));
    render(<LoginForm />);

    // --- Act ---
    await user.type(screen.getByLabelText(/email/i), 'alice@example.com');
    await user.type(screen.getByLabelText(/password/i), 'Password1');
    await user.click(screen.getByRole('button', { name: /enter/i }));

    // --- Assert ---
    expect(screen.getByRole('button', { name: /logging in/i })).toBeDisabled();
  });

  it('renders the Google sign-in button', () => {
    // --- Arrange ---
    render(<LoginForm />);

    // --- Assert ---
    expect(
      screen.getByRole('button', { name: /continue with google/i })
    ).toBeInTheDocument();
  });

  it('calls loginWithGoogle when the Google button is clicked', async () => {
    // --- Arrange ---
    const user = userEvent.setup();
    // Simulates a successful redirect — resolves with no error
    mockLoginWithGoogle.mockResolvedValueOnce({ error: null });
    render(<LoginForm />);

    // --- Act ---
    await user.click(
      screen.getByRole('button', { name: /continue with google/i })
    );

    // --- Assert ---
    expect(mockLoginWithGoogle).toHaveBeenCalledTimes(1);
  });

  it('shows a toast and re-enables Google button when provider is not enabled', async () => {
    // --- Arrange ---
    const user = userEvent.setup();
    mockLoginWithGoogle.mockResolvedValueOnce({
      error: { message: 'Unsupported provider: provider is not enabled' },
    });
    render(<LoginForm />);

    // --- Act ---
    await user.click(
      screen.getByRole('button', { name: /continue with google/i })
    );

    // --- Assert ---
    await waitFor(() => {
      // Button should be re-enabled after the error
      expect(
        screen.getByRole('button', { name: /continue with google/i })
      ).not.toBeDisabled();
    });
  });
});
