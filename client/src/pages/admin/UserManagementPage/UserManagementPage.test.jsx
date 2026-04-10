import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  render,
  screen,
  waitFor,
} from '../../../modules/utils/testing/testing.utils';
import { useAuth } from '../../../providers/AuthProvider/AuthProvider';
import UserManagementPage from './UserManagementPage';

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

vi.mock('../../../modules/api/admin/admin.api', () => ({
  adminApi: {
    getAllUsers: vi.fn(),
  },
}));

import { adminApi } from '../../../modules/api/admin/admin.api';

describe('UserManagementPage Component', () => {
  // Supabase returns snake_case column names
  const mockUsers = [
    {
      id: 'uuid-1',
      username: 'alice',
      role: 'USER',
      created_at: '2024-01-01T00:00:00Z',
    },
    {
      id: 'uuid-2',
      username: 'bob',
      role: 'ADMIN',
      created_at: '2024-02-01T00:00:00Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 'uuid-99', role: 'SUPER_ADMIN' },
    });
  });

  it('shows loading state initially', () => {
    // --- Arrange ---
    vi.mocked(adminApi.getAllUsers).mockImplementation(
      () => new Promise(() => {})
    );

    // --- Act ---
    render(<UserManagementPage />);

    // --- Assert ---
    expect(screen.getByText(/loading user records/i)).toBeInTheDocument();
  });

  it('renders user count and usernames after successful fetch', async () => {
    // --- Arrange ---
    vi.mocked(adminApi.getAllUsers).mockResolvedValueOnce({
      data: mockUsers,
      error: null,
    });

    // --- Act ---
    render(<UserManagementPage />);

    // --- Assert ---
    await waitFor(() => {
      expect(screen.getByText(/total users: 2/i)).toBeInTheDocument();
      expect(screen.getByText('alice')).toBeInTheDocument();
      expect(screen.getByText('bob')).toBeInTheDocument();
    });
  });

  it('shows zero count when data is empty array', async () => {
    // --- Arrange ---
    vi.mocked(adminApi.getAllUsers).mockResolvedValueOnce({
      data: [],
      error: null,
    });

    // --- Act ---
    render(<UserManagementPage />);

    // --- Assert ---
    await waitFor(() => {
      expect(screen.getByText(/total users: 0/i)).toBeInTheDocument();
      expect(screen.getByText(/no users found/i)).toBeInTheDocument();
    });
  });

  it('displays error state when API returns an error', async () => {
    // --- Arrange ---
    vi.mocked(adminApi.getAllUsers).mockResolvedValueOnce({
      data: null,
      error: { message: 'Failed to retrieve user directory.' },
    });

    // --- Act ---
    render(<UserManagementPage />);

    // --- Assert ---
    await waitFor(() => {
      expect(
        screen.getByText(/failed to retrieve user directory/i)
      ).toBeInTheDocument();
    });
  });

  it('shows retry button on error and re-fetches on click', async () => {
    // --- Arrange ---
    vi.mocked(adminApi.getAllUsers)
      .mockResolvedValueOnce({
        data: null,
        error: { message: 'Network error' },
      })
      .mockResolvedValueOnce({
        data: mockUsers,
        error: null,
      });

    const { getByRole } = render(<UserManagementPage />);

    // Wait for error state
    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });

    // --- Act ---
    const retryBtn = getByRole('button', { name: /retry fetch/i });
    retryBtn.click();

    // --- Assert ---
    await waitFor(() => {
      expect(screen.getByText(/total users: 2/i)).toBeInTheDocument();
    });
    expect(adminApi.getAllUsers).toHaveBeenCalledTimes(2);
  });
});
