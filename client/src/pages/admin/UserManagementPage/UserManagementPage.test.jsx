import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '../../../modules/utils/testing/testing.utils';
import { useAuth } from '../../../providers/AuthProvider/AuthProvider';
import UserManagementPage from './UserManagementPage';

// Mock AuthProvider to control auth state and prevent internal side effects
vi.mock('../../../providers/AuthProvider/AuthProvider', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useAuth: vi.fn(),
    AuthProvider: ({ children }) => children,
  };
});

// Mock adminApi locally since fetch is abstracted away from the component
vi.mock('../../../modules/api/admin/admin.api', () => ({
  adminApi: {
    getAllUsers: vi.fn(),
  },
}));

import { adminApi } from '../../../modules/api/admin/admin.api';

describe('UserManagementPage Component', () => {
  it('shows loading state initially', async () => {
    // --- Arrange ---
    vi.mocked(useAuth).mockReturnValue({ user: { id: 1, role: 'ADMIN' } });
    vi.mocked(adminApi.getAllUsers).mockImplementation(() => new Promise(() => {}));

    // --- Act ---
    render(<UserManagementPage />);

    // --- Assert ---
    expect(screen.getByText(/loading user records/i)).toBeInTheDocument();
  });

  it('renders user count after successful fetch', async () => {
    // --- Arrange ---
    const mockUsers = [
      { id: 1, username: 'user1', role: 'USER' },
      { id: 2, username: 'user2', role: 'USER' },
    ];
    vi.mocked(useAuth).mockReturnValue({ user: { id: 99, role: 'ADMIN' } });
    vi.mocked(adminApi.getAllUsers).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ users: mockUsers }),
    });

    // --- Act ---
    render(<UserManagementPage />);

    // --- Assert ---
    await waitFor(() => {
      const statsElement = screen.getByText(/total users:/i);
      expect(statsElement).toHaveTextContent('Total Users: 2');
    });
  });

  it('displays error state on network failure', async () => {
    // --- Arrange ---
    vi.mocked(useAuth).mockReturnValue({ user: { id: 1, role: 'ADMIN' } });
    vi.mocked(adminApi.getAllUsers).mockResolvedValueOnce({ ok: false });

    // --- Act ---
    render(<UserManagementPage />);

    // --- Assert ---
    const errorMsg = await screen.findByText(/failed to retrieve user directory/i);
    expect(errorMsg).toBeInTheDocument();
  });
});