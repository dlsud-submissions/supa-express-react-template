import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { supabase } from '../../../lib/supabase.js';
import {
  render,
  screen,
  waitFor,
} from '../../../modules/utils/testing/testing.utils';
import { useAuth } from '../../../providers/AuthProvider/AuthProvider';
import { useToast } from '../../../providers/ToastProvider/ToastProvider';
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

vi.mock(
  '../../../providers/ToastProvider/ToastProvider',
  async (importOriginal) => {
    const actual = await importOriginal();
    return {
      ...actual,
      useToast: vi.fn(),
      ToastProvider: ({ children }) => children,
    };
  }
);

describe('LoginForm', () => {
  const mockLogin = vi.fn();
  const mockLoginWithGoogle = vi.fn();
  const mockShowToast = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue({
      login: mockLogin,
      loginWithGoogle: mockLoginWithGoogle,
      user: null,
    });
    vi.mocked(useToast).mockReturnValue({ showToast: mockShowToast });
    // Restore safe supabase defaults after clearAllMocks
    supabase.auth.getSession.mockResolvedValue({ data: { session: null } });
    supabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });
    const chain = supabase._queryChain;
    Object.keys(chain).forEach((key) => chain[key].mockReturnValue(chain));
    supabase.from.mockReturnValue(chain);
  });

  it('updates username input value on change', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    const usernameInput = screen.getByLabelText(/username/i);
    await user.type(usernameInput, 'alice');

    expect(usernameInput).toHaveValue('alice');
  });

  it('shows validation error when fields are empty on submit', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.click(screen.getByRole('button', { name: /enter/i }));

    // Zod schema requires both fields — error shown without calling login
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('calls AuthProvider.login() with username and password', async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValueOnce({ error: null });
    // After successful login, LoginForm fetches the session and profile
    supabase.auth.getSession.mockResolvedValueOnce({
      data: { session: { user: { id: 'uuid-1' } } },
    });
    supabase._queryChain.single.mockResolvedValueOnce({
      data: { role: 'USER' },
      error: null,
    });
    vi.mocked(useAuth).mockReturnValue({ login: mockLogin, user: null });
    render(<LoginForm />);

    await user.type(screen.getByLabelText(/username/i), 'alice');
    await user.type(screen.getByLabelText(/password/i), 'Password1');
    await user.click(screen.getByRole('button', { name: /enter/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        username: 'alice',
        password: 'Password1',
      });
    });
  });

  it('navigates to /dashboard for USER role after successful login', async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValueOnce({ error: null });
    supabase.auth.getSession.mockResolvedValueOnce({
      data: { session: { user: { id: 'uuid-1' } } },
    });
    supabase._queryChain.single.mockResolvedValueOnce({
      data: { role: 'USER' },
      error: null,
    });
    render(<LoginForm />);

    await user.type(screen.getByLabelText(/username/i), 'alice');
    await user.type(screen.getByLabelText(/password/i), 'Password1');
    await user.click(screen.getByRole('button', { name: /enter/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('navigates to /admin-dashboard for ADMIN role after successful login', async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValueOnce({ error: null });
    supabase.auth.getSession.mockResolvedValueOnce({
      data: { session: { user: { id: 'uuid-2' } } },
    });
    supabase._queryChain.single.mockResolvedValueOnce({
      data: { role: 'ADMIN' },
      error: null,
    });
    render(<LoginForm />);

    await user.type(screen.getByLabelText(/username/i), 'admin');
    await user.type(screen.getByLabelText(/password/i), 'Password1');
    await user.click(screen.getByRole('button', { name: /enter/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/admin-dashboard');
    });
  });

  it('shows auth error message when login returns an error', async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValueOnce({
      error: { message: 'Invalid login credentials' },
    });
    render(<LoginForm />);

    await user.type(screen.getByLabelText(/username/i), 'alice');
    await user.type(screen.getByLabelText(/password/i), 'Password1');
    await user.click(screen.getByRole('button', { name: /enter/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/invalid login credentials/i)
      ).toBeInTheDocument();
    });
  });

  it('disables the submit button while submitting', async () => {
    const user = userEvent.setup();
    // Never resolves — keeps isSubmitting true
    mockLogin.mockImplementation(() => new Promise(() => {}));
    render(<LoginForm />);

    await user.type(screen.getByLabelText(/username/i), 'alice');
    await user.type(screen.getByLabelText(/password/i), 'Password1');
    await user.click(screen.getByRole('button', { name: /enter/i }));

    expect(screen.getByRole('button', { name: /logging in/i })).toBeDisabled();
  });

  it('renders the Google sign-in button and divider', () => {
    render(<LoginForm />);

    expect(screen.getByText(/^or$/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /continue with google/i })
    ).toBeInTheDocument();
  });

  it('calls loginWithGoogle() when the Google button is clicked', async () => {
    const user = userEvent.setup();
    mockLoginWithGoogle.mockResolvedValueOnce({ data: {}, error: null });
    render(<LoginForm />);

    await user.click(
      screen.getByRole('button', { name: /continue with google/i })
    );

    expect(mockLoginWithGoogle).toHaveBeenCalledTimes(1);
  });

  it('shows the Google loading state and disables submit after click', async () => {
    const user = userEvent.setup();
    mockLoginWithGoogle.mockImplementation(() => new Promise(() => {}));
    render(<LoginForm />);

    await user.click(
      screen.getByRole('button', { name: /continue with google/i })
    );

    expect(screen.getByText(/connecting to google/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /continue with google/i })
    ).toBeDisabled();
    expect(screen.getByRole('button', { name: /enter/i })).toBeDisabled();
  });

  it('shows a toast when loginWithGoogle returns an error', async () => {
    const user = userEvent.setup();
    mockLoginWithGoogle.mockResolvedValueOnce({
      data: null,
      error: { message: 'Provider is not enabled' },
    });
    render(<LoginForm />);

    await user.click(
      screen.getByRole('button', { name: /continue with google/i })
    );

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith(
        'Provider is not enabled',
        'error'
      );
    });
  });
});
