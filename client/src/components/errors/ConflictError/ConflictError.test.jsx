import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import ConflictError from './ConflictError';

describe('ConflictError', () => {
  it('renders nothing when no message is provided', () => {
    // --- Arrange ---
    const { container } = render(<ConflictError message="" />);

    // --- Assert ---
    expect(container.firstChild).toBeNull();
  });

  it('renders the conflict message when provided', () => {
    // --- Arrange ---
    const message = 'Username already taken.';

    // --- Act ---
    render(<ConflictError message={message} />);

    // --- Assert ---
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(message)).toBeInTheDocument();
  });

  it('renders a conflict label alongside the message', () => {
    // --- Arrange ---
    // Confirm text label is present for conflict-specific errors
    render(<ConflictError message="Email already registered." />);

    // --- Assert ---
    expect(screen.getByText('Error:')).toBeInTheDocument();
  });
});
