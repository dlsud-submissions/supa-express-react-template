import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import AuthenticationError from './AuthenticationError';

describe('AuthenticationError', () => {
  it('renders nothing when no message is provided', () => {
    // --- Arrange ---
    const { container } = render(<AuthenticationError message="" />);

    // --- Assert ---
    expect(container.firstChild).toBeNull();
  });

  it('renders the error message when provided', () => {
    // --- Arrange ---
    const message = 'Invalid username or password';

    // --- Act ---
    render(<AuthenticationError message={message} />);

    // --- Assert ---
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(message)).toBeInTheDocument();
  });

  it('renders the error label alongside the message', () => {
    // --- Arrange ---
    // Confirm visual context icon is present for auth-specific errors
    render(<AuthenticationError message="Session expired" />);

    // --- Assert ---
    expect(screen.getByText('Error:')).toBeInTheDocument();
  });
});
