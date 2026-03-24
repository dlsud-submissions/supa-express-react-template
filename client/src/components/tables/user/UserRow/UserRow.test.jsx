import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { useAuth } from '../../../../providers/AuthProvider/AuthProvider';
import {
  render,
  screen,
  waitFor,
} from '../../../../modules/utils/testing/testing.utils';
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

/**
 * Unit tests for the UserRow component.
 * - Verifies row data rendering.
 * - Validates role change flow via ConfirmationModal and Admin API.
 */
describe('UserRow Component', () => {
  const mockUser = {
    id: '123',
    username: 'jdoe',
    role: 'USER',
    createdAt: '2023-01-01T00:00:00Z',
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
  });

  it('calls the promote API and triggers onUpdate on confirmation', async () => {
    // --- Arrange ---
    const user = userEvent.setup();
    const onUpdate = vi.fn();
    vi.mocked(useAuth).mockReturnValue({ user: { role: 'SUPER_ADMIN' } });
    vi.mocked(adminApi.promoteUser).mockResolvedValueOnce({ ok: true });

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

  it('calls the demote API and triggers onUpdate on confirmation', async () => {
    // --- Arrange ---
    const user = userEvent.setup();
    const onUpdate = vi.fn();
    const adminTarget = { ...mockUser, role: 'ADMIN' };
    vi.mocked(useAuth).mockReturnValue({ user: { role: 'SUPER_ADMIN' } });
    vi.mocked(adminApi.demoteUser).mockResolvedValueOnce({ ok: true });

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
});
