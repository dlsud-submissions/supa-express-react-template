import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import { vi } from 'vitest';
import { authApi } from '../../../modules/api/auth/auth.api';
import VerifyEmailPage from './VerifyEmailPage';

vi.mock('../../../modules/api/auth/auth.api', () => ({
  authApi: {
    verifyOtp: vi.fn(),
    sendOtp: vi.fn(),
  },
}));

describe('VerifyEmailPage', () => {
  it('shows missing context when state not provided', async () => {
    render(
      <MemoryRouter initialEntries={['/verify-email']}>
        <Routes>
          <Route path="/verify-email" element={<VerifyEmailPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Missing verification context/i)).toBeTruthy();
    });
  });

  it('submits OTP and navigates on success', async () => {
    const user = userEvent.setup();
    vi.mocked(authApi.verifyOtp).mockResolvedValueOnce({ valid: true });

    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: '/verify-email',
            state: { userId: 'u1', email: 'a@b.c' },
          },
        ]}
      >
        <Routes>
          <Route path="/verify-email" element={<VerifyEmailPage />} />
        </Routes>
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText(/Code/i), '123456');
    await user.click(screen.getByRole('button', { name: /verify/i }));

    await waitFor(() => {
      expect(authApi.verifyOtp).toHaveBeenCalledWith(
        'u1',
        '123456',
        'email_verification'
      );
    });
  });
});
