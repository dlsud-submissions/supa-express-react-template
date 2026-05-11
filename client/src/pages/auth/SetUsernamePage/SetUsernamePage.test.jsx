import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import { vi } from 'vitest';
import { userApi } from '../../../modules/api/user/user.api';
import { ToastProvider } from '../../../providers/ToastProvider/ToastProvider';
import SetUsernamePage from './SetUsernamePage';

vi.mock('../../../modules/api/user/user.api', () => ({
  userApi: {
    updateUsernameById: vi.fn(),
  },
}));

describe('SetUsernamePage', () => {
  it('shows missing context when no userId', async () => {
    render(
      <MemoryRouter initialEntries={['/setup-username']}>
        <Routes>
          <Route
            path="/setup-username"
            element={
              <ToastProvider>
                <SetUsernamePage />
              </ToastProvider>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Missing user context/i)).toBeTruthy();
    });
  });

  it('calls updateUsername and navigates on success', async () => {
    const user = userEvent.setup();
    vi.mocked(userApi.updateUsernameById).mockResolvedValueOnce({
      error: null,
    });

    render(
      <MemoryRouter
        initialEntries={[
          { pathname: '/setup-username', state: { userId: 'u1' } },
        ]}
      >
        <Routes>
          <Route
            path="/setup-username"
            element={
              <ToastProvider>
                <SetUsernamePage />
              </ToastProvider>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText(/Username/i), 'newuser');
    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(userApi.updateUsernameById).toHaveBeenCalledWith('u1', 'newuser');
    });
  });

  it('shows ConflictError on unique violation', async () => {
    const user = userEvent.setup();
    vi.mocked(userApi.updateUsernameById).mockResolvedValueOnce({
      error: { code: '23505', message: 'duplicate key' },
    });

    render(
      <MemoryRouter
        initialEntries={[
          { pathname: '/setup-username', state: { userId: 'u1' } },
        ]}
      >
        <Routes>
          <Route
            path="/setup-username"
            element={
              <ToastProvider>
                <SetUsernamePage />
              </ToastProvider>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText(/Username/i), 'taken');
    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(screen.getByText(/Username already taken/i)).toBeTruthy();
    });
  });
});
