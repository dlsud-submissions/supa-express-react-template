import { Routes, Route } from 'react-router';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '../../modules/utils/testing/testing.utils';
import { useAuth } from '../../providers/AuthProvider/AuthProvider';
import ProfilePage from './ProfilePage';

// Mock AuthProvider hook to control profile access
vi.mock('../../providers/AuthProvider/AuthProvider', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useAuth: vi.fn(),
  };
});

// Mock userApi locally since fetch is abstracted away from the component
vi.mock('../../modules/api/user/user.api', () => ({
  userApi: {
    getProfile: vi.fn(),
    getById: vi.fn(),
  },
}));

import { userApi } from '../../modules/api/user/user.api';

describe('ProfilePage Component', () => {
  const mockCurrentUser = {
    id: 'admin-1',
    username: 'admin_boss',
    role: 'ADMIN',
  };
  const mockTargetUser = {
    id: 'user-123',
    username: 'test_subject',
    role: 'USER',
    email: 'test@example.com',
  };

  it('renders the current user profile when no ID is provided', async () => {
    // --- Arrange ---
    vi.mocked(useAuth).mockReturnValue({ user: mockCurrentUser });
    vi.mocked(userApi.getProfile).mockResolvedValueOnce({
      ok: true,
      json: async () => mockCurrentUser,
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
  });

  it('fetches and displays another user profile when an ID is provided', async () => {
    // --- Arrange ---
    vi.mocked(useAuth).mockReturnValue({ user: mockCurrentUser });
    vi.mocked(userApi.getById).mockResolvedValueOnce({
      ok: true,
      json: async () => mockTargetUser,
    });

    // --- Act ---
    render(
      <Routes>
        <Route path="/profile/:id" element={<ProfilePage />} />
      </Routes>,
      { initialEntries: ['/profile/user-123'] }
    );

    // --- Assert ---
    await waitFor(() => {
      expect(screen.getByText('test_subject')).toBeInTheDocument();
      expect(screen.getByText('USER')).toBeInTheDocument();
    });
  });
});