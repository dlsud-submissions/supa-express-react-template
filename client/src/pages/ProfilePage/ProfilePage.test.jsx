import { Route, Routes } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  render,
  screen,
  waitFor,
} from '../../modules/utils/testing/testing.utils';
import { useAuth } from '../../providers/AuthProvider/AuthProvider';
import ProfilePage from './ProfilePage';

vi.mock('../../providers/AuthProvider/AuthProvider', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useAuth: vi.fn(),
    AuthProvider: ({ children }) => children,
  };
});

vi.mock('../../modules/api/user/user.api', () => ({
  userApi: {
    getProfile: vi.fn(),
    getById: vi.fn(),
  },
}));

import { userApi } from '../../modules/api/user/user.api';

describe('ProfilePage Component', () => {
  const mockCurrentUser = {
    id: 'admin-uuid-1',
    username: 'admin_boss',
    role: 'ADMIN',
  };

  // Supabase returns snake_case column names
  const mockProfileData = {
    id: 'admin-uuid-1',
    username: 'admin_boss',
    role: 'ADMIN',
    created_at: '2024-01-01T00:00:00Z',
    last_login: null,
  };

  const mockTargetData = {
    id: 'user-uuid-123',
    username: 'test_subject',
    role: 'USER',
    created_at: '2024-03-15T00:00:00Z',
    last_login: '2024-04-01T10:00:00Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the current user profile when no ID param is provided', async () => {
    // --- Arrange ---
    vi.mocked(useAuth).mockReturnValue({ user: mockCurrentUser });
    vi.mocked(userApi.getProfile).mockResolvedValueOnce({
      data: mockProfileData,
      error: null,
    });

    // --- Act ---
    render(
      <Routes>
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>,
      { initialEntries: ['/profile'] }
    );

    // --- Assert ---
    await waitFor(() => {
      expect(screen.getByText('admin_boss')).toBeInTheDocument();
      expect(screen.getByText('ADMIN')).toBeInTheDocument();
    });
    expect(userApi.getProfile).toHaveBeenCalled();
    expect(userApi.getById).not.toHaveBeenCalled();
  });

  it('fetches and displays another user profile when an ID param is provided', async () => {
    // --- Arrange ---
    vi.mocked(useAuth).mockReturnValue({ user: mockCurrentUser });
    vi.mocked(userApi.getById).mockResolvedValueOnce({
      data: mockTargetData,
      error: null,
    });

    // --- Act ---
    render(
      <Routes>
        <Route path="/profile/:id" element={<ProfilePage />} />
      </Routes>,
      { initialEntries: ['/profile/user-uuid-123'] }
    );

    // --- Assert ---
    await waitFor(() => {
      expect(screen.getByText('test_subject')).toBeInTheDocument();
      expect(screen.getByText('USER')).toBeInTheDocument();
    });
    expect(userApi.getById).toHaveBeenCalledWith('user-uuid-123');
  });

  it('shows error state when the API returns an error', async () => {
    // --- Arrange ---
    vi.mocked(useAuth).mockReturnValue({ user: mockCurrentUser });
    vi.mocked(userApi.getProfile).mockResolvedValueOnce({
      data: null,
      error: { message: 'User profile not found' },
    });

    // --- Act ---
    render(
      <Routes>
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>,
      { initialEntries: ['/profile'] }
    );

    // --- Assert ---
    await waitFor(() => {
      expect(screen.getByText(/user profile not found/i)).toBeInTheDocument();
    });
  });

  it('shows loading state before data resolves', () => {
    // --- Arrange ---
    vi.mocked(useAuth).mockReturnValue({ user: mockCurrentUser });
    // Never resolves — keeps the component in loading state
    vi.mocked(userApi.getProfile).mockImplementation(
      () => new Promise(() => {})
    );

    // --- Act ---
    render(
      <Routes>
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>,
      { initialEntries: ['/profile'] }
    );

    // --- Assert ---
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('renders Never for last_login when it is null', async () => {
    // --- Arrange ---
    vi.mocked(useAuth).mockReturnValue({ user: mockCurrentUser });
    vi.mocked(userApi.getProfile).mockResolvedValueOnce({
      data: { ...mockProfileData, last_login: null },
      error: null,
    });

    // --- Act ---
    render(
      <Routes>
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>,
      { initialEntries: ['/profile'] }
    );

    // --- Assert ---
    await waitFor(() => {
      expect(screen.getByText('Never')).toBeInTheDocument();
    });
  });
});
