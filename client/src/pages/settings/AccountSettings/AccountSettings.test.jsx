import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { authApi } from '../../../modules/api/auth/auth.api';
import {
  render,
  screen,
  waitFor,
} from '../../../modules/utils/testing/testing.utils';
import { useAuth } from '../../../providers/AuthProvider/AuthProvider';
import { useToast } from '../../../providers/ToastProvider/ToastProvider';
import AccountSettings from './AccountSettings';

vi.mock('../../../modules/api/auth/auth.api', () => ({
  authApi: {
    sendOtp: vi.fn(),
    verifyOtp: vi.fn(),
    updatePassword: vi.fn(),
  },
}));

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

vi.mock(
  '../../../providers/AuthProvider/AuthProvider',
  async (importOriginal) => {
    const actual = await importOriginal();
    return {
      ...actual,
      useAuth: vi.fn(),
    };
  }
);

describe('AccountSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useToast).mockReturnValue({ showToast: vi.fn() });
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 'uid-1', email: 'me@example.com' },
    });
  });

  it('sends an OTP and reveals verification step', async () => {
    const user = userEvent.setup();
    vi.mocked(authApi.sendOtp).mockResolvedValueOnce({});

    render(<AccountSettings />);

    await user.click(
      screen.getByRole('button', { name: /Send verification code/i })
    );

    expect(authApi.sendOtp).toHaveBeenCalledWith(
      'uid-1',
      'me@example.com',
      'password_reset'
    );
    expect(
      await screen.findByLabelText(/Verification code/i)
    ).toBeInTheDocument();
  });

  it('shows error when verification token is invalid', async () => {
    const user = userEvent.setup();
    vi.mocked(authApi.sendOtp).mockResolvedValueOnce({});
    vi.mocked(authApi.verifyOtp).mockResolvedValueOnce({ valid: false });

    render(<AccountSettings />);

    await user.click(
      screen.getByRole('button', { name: /Send verification code/i })
    );
    const tokenInput = await screen.findByLabelText(/Verification code/i);
    await user.type(tokenInput, '000000');
    await user.click(screen.getByRole('button', { name: /Verify code/i }));

    expect(
      await screen.findByText(/Invalid or expired code/i)
    ).toBeInTheDocument();
  });

  it('accepts a valid token and allows password update', async () => {
    const user = userEvent.setup();
    vi.mocked(authApi.sendOtp).mockResolvedValueOnce({});
    vi.mocked(authApi.verifyOtp).mockResolvedValueOnce({ valid: true });
    vi.mocked(authApi.updatePassword).mockResolvedValueOnce({
      data: {},
      error: null,
    });
    const showToast = vi.fn();
    vi.mocked(useToast).mockReturnValue({ showToast });

    render(<AccountSettings />);

    await user.click(
      screen.getByRole('button', { name: /Send verification code/i })
    );
    const tokenInput = await screen.findByLabelText(/Verification code/i);
    await user.type(tokenInput, '123456');
    await user.click(screen.getByRole('button', { name: /Verify code/i }));

    // Now on password step
    const newInput = await screen.findByLabelText(/New password/i);
    const confirmInput = screen.getByLabelText(/Confirm password/i);
    await user.type(newInput, 'NewPassword1');
    await user.type(confirmInput, 'NewPassword1');
    await user.click(screen.getByRole('button', { name: /Update password/i }));

    await waitFor(() => {
      expect(authApi.updatePassword).toHaveBeenCalledWith('NewPassword1');
      expect(showToast).toHaveBeenCalledWith('Password updated', 'success');
      // After success, user is returned to step 1
      expect(
        screen.getByRole('button', { name: /Send verification code/i })
      ).toBeInTheDocument();
    });
  });

  it('shows validation error when passwords do not match', async () => {
    const user = userEvent.setup();
    vi.mocked(authApi.sendOtp).mockResolvedValueOnce({});
    vi.mocked(authApi.verifyOtp).mockResolvedValueOnce({ valid: true });

    render(<AccountSettings />);

    await user.click(
      screen.getByRole('button', { name: /Send verification code/i })
    );
    const tokenInput = await screen.findByLabelText(/Verification code/i);
    await user.type(tokenInput, '123456');
    await user.click(screen.getByRole('button', { name: /Verify code/i }));

    const newInput = await screen.findByLabelText(/New password/i);
    const confirmInput = screen.getByLabelText(/Confirm password/i);
    await user.type(newInput, 'NewPassword1');
    await user.type(confirmInput, 'Different1');
    await user.click(screen.getByRole('button', { name: /Update password/i }));

    expect(await screen.findByText(/Validation failed/i)).toBeInTheDocument();
    expect(screen.getByText(/Passwords don't match/i)).toBeInTheDocument();
    expect(authApi.updatePassword).not.toHaveBeenCalled();
  });
});
