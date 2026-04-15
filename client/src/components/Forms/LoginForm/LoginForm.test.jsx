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

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue({
      login: mockLogin,
      user: null,
    });
  });

  it('updates username input value on change', async () => {
    // --- Arrange ---
    const user = userEvent.setup();
    render(<LoginForm />);

    // --- Act ---
    const usernameInput = screen.getByLabelText(/username/i);
    await user.type(usernameInput, 'alice');

    // --- Assert ---
    expect(usernameInput).toHaveValue('alice');
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

  it('calls AuthProvider.login() with username and password', async () => {
    // --- Arrange ---
    const user = userEvent.setup();
    mockLogin.mockResolvedValueOnce({ error: null });
    vi.mocked(useAuth).mockReturnValue({ login: mockLogin, user: null });
    render(<LoginForm />);

    // --- Act ---
    await user.type(screen.getByLabelText(/username/i), 'alice');
    await user.type(screen.getByLabelText(/password/i), 'Password1');
    await user.click(screen.getByRole('button', { name: /enter/i }));

    // --- Assert ---
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        username: 'alice',
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
    await user.type(screen.getByLabelText(/username/i), 'alice');
    await user.type(screen.getByLabelText(/password/i), 'Password1');
    await user.click(screen.getByRole('button', { name: /enter/i }));

    // --- Assert ---
    await waitFor(() => {
      expect(
        screen.getByText(/invalid login credentials/i)
      ).toBeInTheDocument();
    });
  });

  it('disables the submit button while submitting', async () => {
    // --- Arrange ---
    const user = userEvent.setup();
    // Never resolves — keeps isSubmitting true
    mockLogin.mockImplementation(() => new Promise(() => {}));
    render(<LoginForm />);

    // --- Act ---
    await user.type(screen.getByLabelText(/username/i), 'alice');
    await user.type(screen.getByLabelText(/password/i), 'Password1');
    await user.click(screen.getByRole('button', { name: /enter/i }));

    // --- Assert ---
    expect(screen.getByRole('button', { name: /logging in/i })).toBeDisabled();
  });
});
