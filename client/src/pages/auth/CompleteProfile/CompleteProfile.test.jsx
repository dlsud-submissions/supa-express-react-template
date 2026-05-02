import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '../../../modules/utils/testing/testing.utils';
import { userApi } from '../../../modules/api/user/user.api';
import { useAuth } from '../../../providers/AuthProvider/AuthProvider';
import { useToast } from '../../../providers/ToastProvider/ToastProvider';
import CompleteProfile from './CompleteProfile';

const mockShowToast = vi.fn();

vi.mock('../../../providers/AuthProvider/AuthProvider', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useAuth: vi.fn(),
    AuthProvider: ({ children }) => children,
  };
});

vi.mock('../../../providers/ToastProvider/ToastProvider', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useToast: vi.fn(),
    ToastProvider: ({ children }) => children,
  };
});

vi.mock('../../../modules/api/user/user.api', () => ({
  userApi: {
    updateUsername: vi.fn(),
  },
}));

describe('CompleteProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue({
      user: {
        id: 'user-123',
        username: 'user_1234',
        role: 'USER',
        provider: 'google',
        username_confirmed: false,
      },
    });
    vi.mocked(useToast).mockReturnValue({ showToast: mockShowToast });
  });

  it('renders the username input with the current username value', () => {
    render(<CompleteProfile />);

    expect(screen.getByLabelText(/username/i)).toHaveValue('user_1234');
  });

  it('shows validation errors on invalid submit', async () => {
    const user = userEvent.setup();
    render(<CompleteProfile />);

    const input = screen.getByLabelText(/username/i);
    await user.clear(input);
    await user.type(input, 'a!');
    await user.click(screen.getByRole('button', { name: /save username/i }));

    expect(
      await screen.findByText(/username must be at least 3 characters/i)
    ).toBeInTheDocument();
    expect(userApi.updateUsername).not.toHaveBeenCalled();
  });

  it('calls updateUsername and redirects on success', async () => {
    const user = userEvent.setup();
    vi.mocked(userApi.updateUsername).mockResolvedValueOnce({
      data: {
        id: 'user-123',
        username: 'fresh_name',
        username_confirmed: true,
      },
      error: null,
    });

    render(<CompleteProfile />);

    const input = screen.getByLabelText(/username/i);
    await user.clear(input);
    await user.type(input, 'fresh_name');
    await user.click(screen.getByRole('button', { name: /save username/i }));

    await waitFor(() => {
      expect(userApi.updateUsername).toHaveBeenCalledWith('fresh_name');
      expect(mockShowToast).toHaveBeenCalledWith(
        'Username updated successfully',
        'success'
      );
      expect(window.location.assign).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('shows an error when updateUsername returns an error', async () => {
    const user = userEvent.setup();
    vi.mocked(userApi.updateUsername).mockResolvedValueOnce({
      data: null,
      error: { message: 'Username already taken' },
    });

    render(<CompleteProfile />);

    const input = screen.getByLabelText(/username/i);
    await user.clear(input);
    await user.type(input, 'taken_name');
    await user.click(screen.getByRole('button', { name: /save username/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/username already taken/i)
      ).toBeInTheDocument();
    });
  });
});
