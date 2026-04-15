import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SignupForm from './SignupForm';

// Mock authApi — SignupForm calls authApi.signup() directly
vi.mock('../../../modules/api/auth/auth.api.js', () => ({
  authApi: {
    signup: vi.fn(),
  },
}));

import { authApi } from '../../../modules/api/auth/auth.api.js';

describe('SignupForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderForm = () =>
    render(
      <MemoryRouter>
        <SignupForm />
      </MemoryRouter>
    );

  it('updates input values on change', async () => {
    // --- Arrange ---
    const user = userEvent.setup();
    renderForm();

    // --- Act ---
    const usernameInput = screen.getByLabelText(/username/i);
    await user.type(usernameInput, 'newuser');

    // --- Assert ---
    expect(usernameInput).toHaveValue('newuser');
  });

  it('shows validation error when passwords do not match', async () => {
    // --- Arrange ---
    const user = userEvent.setup();
    renderForm();

    // --- Act ---
    await user.type(screen.getByLabelText(/username/i), 'testuser');
    await user.type(screen.getByLabelText(/^password/i), 'Password1');
    await user.type(screen.getByLabelText(/confirm password/i), 'Different1');
    await user.click(screen.getByRole('button', { name: /register/i }));

    // --- Assert ---
    expect(
      await screen.findByText(/passwords don't match/i)
    ).toBeInTheDocument();
    expect(authApi.signup).not.toHaveBeenCalled();
  });

  it('calls authApi.signup() with username and password on valid submit', async () => {
    // --- Arrange ---
    const user = userEvent.setup();
    // Supabase SDK shape: { data, error }
    vi.mocked(authApi.signup).mockResolvedValueOnce({ data: {}, error: null });
    renderForm();

    // --- Act ---
    await user.type(screen.getByLabelText(/username/i), 'newuser');
    await user.type(screen.getByLabelText(/^password/i), 'Password1');
    await user.type(screen.getByLabelText(/confirm password/i), 'Password1');
    await user.click(screen.getByRole('button', { name: /register/i }));

    // --- Assert ---
    await waitFor(() => {
      expect(authApi.signup).toHaveBeenCalledWith(
        expect.objectContaining({
          username: 'newuser',
          password: 'Password1',
        })
      );
    });
  });

  it('shows error message when authApi.signup() returns an error', async () => {
    // --- Arrange ---
    const user = userEvent.setup();
    vi.mocked(authApi.signup).mockResolvedValueOnce({
      data: null,
      error: { message: 'User already registered' },
    });
    renderForm();

    // --- Act ---
    await user.type(screen.getByLabelText(/username/i), 'existing');
    await user.type(screen.getByLabelText(/^password/i), 'Password1');
    await user.type(screen.getByLabelText(/confirm password/i), 'Password1');
    await user.click(screen.getByRole('button', { name: /register/i }));

    // --- Assert ---
    await waitFor(() => {
      expect(
        screen.getByText(/user already registered/i)
      ).toBeInTheDocument();
    });
  });

  it('disables the submit button while submitting', async () => {
    // --- Arrange ---
    const user = userEvent.setup();
    // Never resolves — keeps isSubmitting true
    vi.mocked(authApi.signup).mockImplementation(() => new Promise(() => {}));
    renderForm();

    // --- Act ---
    await user.type(screen.getByLabelText(/username/i), 'newuser');
    await user.type(screen.getByLabelText(/^password/i), 'Password1');
    await user.type(screen.getByLabelText(/confirm password/i), 'Password1');
    await user.click(screen.getByRole('button', { name: /register/i }));

    // --- Assert ---
    expect(
      screen.getByRole('button', { name: /registering/i })
    ).toBeDisabled();
  });
});
