import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  render,
  screen,
  waitFor,
} from '../../../../modules/utils/testing/testing.utils';
import { useAuth } from '../../../../providers/AuthProvider/AuthProvider';
import UserRow from './UserRow';

vi.mock('../../../../providers/AuthProvider/AuthProvider', () => ({
  useAuth: vi.fn(),
  AuthProvider: ({ children }) => <div>{children}</div>,
}));

vi.mock('../../../../modules/api/admin/admin.api', () => ({
  adminApi: {
    promoteUser: vi.fn(),
    demoteUser: vi.fn(),
  },
}));

import { adminApi } from '../../../../modules/api/admin/admin.api';

describe('UserRow Component', () => {
  // Supabase returns snake_case column names
  const mockUser = {
    id: 'uuid-123',
    username: 'jdoe',
    role: 'USER',
    created_at: '2024-01-01T00:00:00Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders user details correctly', () => {
    // --- Arrange ---
    vi.mocked(useAuth).mockReturnValue({ user: { role: 'ADMIN' } });

    // --- Act ---
    render(
      <table>
        <tbody>
          <UserRow user={mockUser} onUpdate={vi.fn()} />
        </tbody>
      </table>
    );

    // --- Assert ---
    expect(screen.getByText('jdoe')).toBeInTheDocument();
    expect(screen.getByText('USER')).toBeInTheDocument();
    // created_at date rendered as locale string
    expect(
      screen.getByText(new Date('2024-01-01T00:00:00Z').toLocaleDateString())
    ).toBeInTheDocument();
  });

  it('calls promoteUser and triggers onUpdate on promotion confirmation', async () => {
    // --- Arrange ---
    const user = userEvent.setup();
    const onUpdate = vi.fn();
    vi.mocked(useAuth).mockReturnValue({ user: { role: 'SUPER_ADMIN' } });
    // New shape: { data, error } instead of { ok }
    vi.mocked(adminApi.promoteUser).mockResolvedValueOnce({
      data: { id: 'uuid-123', role: 'ADMIN' },
      error: null,
    });

    // --- Act ---
    render(
      <table>
        <tbody>
          <UserRow user={mockUser} onUpdate={onUpdate} />
        </tbody>
      </table>
    );
    await user.click(screen.getByLabelText(/open actions menu/i));
    await user.click(screen.getByText(/promote to admin/i));
    await user.click(screen.getByRole('button', { name: /^promote$/i }));

    // --- Assert ---
    await waitFor(() => {
      expect(adminApi.promoteUser).toHaveBeenCalledWith(mockUser.id);
      expect(onUpdate).toHaveBeenCalled();
    });
  });

  it('calls demoteUser and triggers onUpdate on demotion confirmation', async () => {
    // --- Arrange ---
    const user = userEvent.setup();
    const onUpdate = vi.fn();
    const adminTarget = { ...mockUser, role: 'ADMIN' };
    vi.mocked(useAuth).mockReturnValue({ user: { role: 'SUPER_ADMIN' } });
    vi.mocked(adminApi.demoteUser).mockResolvedValueOnce({
      data: { id: 'uuid-123', role: 'USER' },
      error: null,
    });

    // --- Act ---
    render(
      <table>
        <tbody>
          <UserRow user={adminTarget} onUpdate={onUpdate} />
        </tbody>
      </table>
    );
    await user.click(screen.getByLabelText(/open actions menu/i));
    await user.click(screen.getByText(/demote to user/i));
    await user.click(screen.getByRole('button', { name: /^demote$/i }));

    // --- Assert ---
    await waitFor(() => {
      expect(adminApi.demoteUser).toHaveBeenCalledWith(adminTarget.id);
      expect(onUpdate).toHaveBeenCalled();
    });
  });

  it('shows error toast and does not call onUpdate when API returns an error', async () => {
    // --- Arrange ---
    const user = userEvent.setup();
    const onUpdate = vi.fn();
    vi.mocked(useAuth).mockReturnValue({ user: { role: 'SUPER_ADMIN' } });
    vi.mocked(adminApi.promoteUser).mockResolvedValueOnce({
      data: null,
      error: { message: 'Permission denied' },
    });

    // --- Act ---
    render(
      <table>
        <tbody>
          <UserRow user={mockUser} onUpdate={onUpdate} />
        </tbody>
      </table>
    );
    await user.click(screen.getByLabelText(/open actions menu/i));
    await user.click(screen.getByText(/promote to admin/i));
    await user.click(screen.getByRole('button', { name: /^promote$/i }));

    // --- Assert ---
    await waitFor(() => {
      expect(adminApi.promoteUser).toHaveBeenCalledWith(mockUser.id);
      expect(onUpdate).not.toHaveBeenCalled();
    });
  });

  it('does not show promote or demote actions for non-SUPER_ADMIN users', () => {
    // --- Arrange ---
    vi.mocked(useAuth).mockReturnValue({ user: { role: 'ADMIN' } });

    // --- Act ---
    render(
      <table>
        <tbody>
          <UserRow user={mockUser} onUpdate={vi.fn()} />
        </tbody>
      </table>
    );

    // Actions menu not yet opened — neither action should exist in DOM
    // --- Assert ---
    expect(screen.queryByText(/promote to admin/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/demote to user/i)).not.toBeInTheDocument();
  });
});
