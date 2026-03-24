import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../modules/utils/testing/testing.utils';
import { authApi } from '../../../modules/api/auth/auth.api.js';
import LoginForm from './LoginForm';

vi.mock('../../../modules/api/auth/auth.api.js', () => ({
  authApi: {
    login: vi.fn(),
  },
}));

describe('LoginForm', () => {
  it('updates input values on change', async () => {
    // --- Arrange ---
    const user = userEvent.setup();
    render(<LoginForm />);

    // --- Act ---
    const usernameInput = screen.getByLabelText(/Username/i);
    await user.type(usernameInput, 'john_doe');

    // --- Assert ---
    expect(usernameInput).toHaveValue('john_doe');
  });

  it('displays error message for invalid login attempt', async () => {
    // --- Arrange ---
    const user = userEvent.setup();

    // Set up the mock return value before rendering/acting
    vi.mocked(authApi.login).mockResolvedValue({
      ok: false,
      json: async () => ({
        message: 'Invalid credentials format',
        errors: [],
      }),
    });

    render(<LoginForm />);

    // --- Act ---
    // Fill inputs to bypass client-side 'required' validation if necessary
    await user.type(screen.getByLabelText(/Username/i), 'wrong');
    await user.type(screen.getByLabelText(/Password/i), 'wrong');

    const submitBtn = screen.getByRole('button', { name: /Enter/i });
    await user.click(submitBtn);

    // --- Assert ---
    // The findByText will wait for the async state update
    const summaryError = await screen.findByText(/Invalid credentials format/i);
    expect(summaryError).toBeInTheDocument();
  });
});
