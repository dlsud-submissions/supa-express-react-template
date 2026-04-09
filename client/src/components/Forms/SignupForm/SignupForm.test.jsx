import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { authApi } from '../../../modules/api/auth/auth.api.js';
import SignupForm from './SignupForm';

// Mock the authApi module
vi.mock('../../../modules/api/auth/auth.api.js', () => ({
  authApi: {
    signup: vi.fn(),
  },
}));

describe('SignupForm', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('updates input values on change', async () => {
    render(
      <MemoryRouter>
        <SignupForm />
      </MemoryRouter>
    );

    const usernameInput = screen.getByLabelText(/Username/i);
    await user.type(usernameInput, 'new_user');
    expect(usernameInput).toHaveValue('new_user');
  });

  it('displays error if passwords do not match', async () => {
    render(
      <MemoryRouter>
        <SignupForm />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText(/Username/i), 'testuser');
    await user.type(screen.getByLabelText(/^Password/i), 'Pass123!');
    await user.type(screen.getByLabelText(/Confirm Password/i), 'Wrong123!');
    await user.click(screen.getByRole('button', { name: /Register/i }));

    expect(
      await screen.findByText(/Passwords don't match/i)
    ).toBeInTheDocument();
  });

  it('shows error message when Supabase signup fails', async () => {
    // Mock a failed Supabase response
    vi.mocked(authApi.signup).mockResolvedValue({
      data: null,
      error: { message: 'User already exists' },
    });

    render(
      <MemoryRouter>
        <SignupForm />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText(/Username/i), 'existing_user');
    await user.type(screen.getByLabelText(/^Password/i), 'Pass123!');
    await user.type(screen.getByLabelText(/Confirm Password/i), 'Pass123!');
    await user.click(screen.getByRole('button', { name: /Register/i }));

    expect(await screen.findByText(/User already exists/i)).toBeInTheDocument();
  });
});
