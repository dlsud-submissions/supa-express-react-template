import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import {
  render,
  screen,
  waitFor,
} from '../../../modules/utils/testing/testing.utils';
import { userApi } from '../../../modules/api/user/user.api';
import { useToast } from '../../../providers/ToastProvider/ToastProvider';
import ProfileSettings from './ProfileSettings';

vi.mock('../../../modules/api/user/user.api', () => ({
  userApi: {
    getProfile: vi.fn(),
    updateProfile: vi.fn(),
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

describe('ProfileSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useToast).mockReturnValue({ showToast: vi.fn() });
  });

  it('loads the current username and avatar URL', async () => {
    vi.mocked(userApi.getProfile).mockResolvedValueOnce({
      data: {
        username: 'current_user',
        avatar_url: 'https://example.com/current.png',
      },
      error: null,
    });

    render(<ProfileSettings />);

    expect(screen.getByText(/Loading profile settings/i)).toBeInTheDocument();

    expect(await screen.findByLabelText(/Username/i)).toHaveValue(
      'current_user'
    );
    expect(screen.getByLabelText(/Avatar URL/i)).toHaveValue(
      'https://example.com/current.png'
    );
  });

  it('saves a valid profile update and shows a success toast', async () => {
    const user = userEvent.setup();
    const showToast = vi.fn();
    vi.mocked(useToast).mockReturnValue({ showToast });
    vi.mocked(userApi.getProfile).mockResolvedValueOnce({
      data: { username: 'current_user', avatar_url: '' },
      error: null,
    });
    vi.mocked(userApi.updateProfile).mockResolvedValueOnce({
      data: {
        username: 'fresh_user',
        avatar_url: 'https://example.com/fresh.png',
      },
      error: null,
    });

    render(<ProfileSettings />);

    const usernameInput = await screen.findByLabelText(/Username/i);
    const avatarInput = screen.getByLabelText(/Avatar URL/i);

    await user.clear(usernameInput);
    await user.type(usernameInput, 'fresh_user');
    await user.type(avatarInput, 'https://example.com/fresh.png');
    await user.click(screen.getByRole('button', { name: /Save profile/i }));

    await waitFor(() => {
      expect(userApi.updateProfile).toHaveBeenCalledWith({
        username: 'fresh_user',
        avatar_url: 'https://example.com/fresh.png',
      });
      expect(showToast).toHaveBeenCalledWith(
        'Profile settings saved',
        'success'
      );
    });
  });

  it('shows ConflictError when the username is taken', async () => {
    const user = userEvent.setup();
    vi.mocked(userApi.getProfile).mockResolvedValueOnce({
      data: { username: 'current_user', avatar_url: '' },
      error: null,
    });
    vi.mocked(userApi.updateProfile).mockResolvedValueOnce({
      data: null,
      error: { code: '23505', message: 'duplicate key value' },
    });

    render(<ProfileSettings />);

    const usernameInput = await screen.findByLabelText(/Username/i);
    await user.clear(usernameInput);
    await user.type(usernameInput, 'taken_user');
    await user.click(screen.getByRole('button', { name: /Save profile/i }));

    expect(
      await screen.findByText(/That username is already taken/i)
    ).toBeInTheDocument();
  });

  it('shows ValidationError for invalid profile data', async () => {
    const user = userEvent.setup();
    vi.mocked(userApi.getProfile).mockResolvedValueOnce({
      data: { username: 'current_user', avatar_url: '' },
      error: null,
    });

    render(<ProfileSettings />);

    const usernameInput = await screen.findByLabelText(/Username/i);
    await user.clear(usernameInput);
    await user.type(usernameInput, 'ab');
    await user.click(screen.getByRole('button', { name: /Save profile/i }));

    expect(await screen.findByText(/Validation failed/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Username must be at least 3 characters/i)
    ).toBeInTheDocument();
    expect(userApi.updateProfile).not.toHaveBeenCalled();
  });
});
