import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuth } from '../../../providers/AuthProvider/AuthProvider';
import LoginForm from './LoginForm';

// Mock the auth provider and toast hooks
vi.mock('../../../providers/AuthProvider/AuthProvider', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../../../providers/ToastProvider/ToastProvider', () => ({
  useToast: vi.fn(() => ({ showToast: vi.fn() })),
}));

describe('LoginForm', () => {
  const user = userEvent.setup();
  const mockLogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue({
      login: mockLogin,
      user: null,
    });
  });

  it('updates input values on change', async () => {
    render(
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>
    );

    const usernameInput = screen.getByLabelText(/Username/i);
    await user.type(usernameInput, 'john_doe');
    expect(usernameInput).toHaveValue('john_doe');
  });

  it('displays authentication error when login fails', async () => {
    // Mock failed login return shape from AuthProvider
    mockLogin.mockResolvedValue({
      error: { message: 'Invalid login credentials' },
    });

    render(
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText(/Username/i), 'wrong_user');
    await user.type(screen.getByLabelText(/Password/i), 'wrong_pass');
    await user.click(screen.getByRole('button', { name: /Enter/i }));

    expect(
      await screen.findByText(/Invalid login credentials/i)
    ).toBeInTheDocument();
  });

  it('disables submit button while authenticating', async () => {
    // Mock a slow login response
    mockLogin.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    render(
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText(/Username/i), 'user');
    await user.type(screen.getByLabelText(/Password/i), 'password');
    await user.click(screen.getByRole('button', { name: /Enter/i }));

    const button = screen.getByRole('button', { name: /Logging in.../i });
    expect(button).toBeDisabled();
  });
});
