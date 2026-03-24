import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router';
import { describe, it, expect, vi } from 'vitest';
import SignupForm from './SignupForm';

describe('SignupForm', () => {
  it('displays error if passwords do not match', async () => {
    // --- Arrange ---
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <SignupForm />
      </MemoryRouter>
    );

    // --- Act ---
    // Simulate realistic typing and clicking
    await user.type(screen.getByLabelText(/Username/i), 'testuser');
    await user.type(screen.getByLabelText(/^Password/i), 'Password123');
    await user.type(screen.getByLabelText(/Confirm Password/i), 'Different123');
    await user.click(screen.getByRole('button', { name: /Register/i }));

    // --- Assert ---
    // Use jest-dom's toBeInTheDocument for better semantic checking
    expect(
      await screen.findByText(/Passwords don't match/i)
    ).toBeInTheDocument();
  });

  it('updates input values on change', async () => {
    // --- Arrange ---
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <SignupForm />
      </MemoryRouter>
    );

    // --- Act ---
    const usernameInput = screen.getByLabelText(/Username/i);
    await user.type(usernameInput, 'john_doe');

    // --- Assert ---
    expect(usernameInput).toHaveValue('john_doe');
  });
});
