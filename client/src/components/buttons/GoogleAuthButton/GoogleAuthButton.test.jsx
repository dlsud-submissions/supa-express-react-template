import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import GoogleAuthButton from './GoogleAuthButton';

describe('GoogleAuthButton', () => {
  it('renders the default label and Google logo SVG', () => {
    // --- Arrange ---
    render(<GoogleAuthButton onClick={vi.fn()} />);

    // --- Assert ---
    expect(
      screen.getByRole('button', { name: /continue with google/i })
    ).toBeInTheDocument();
    expect(screen.getByText('Continue with Google')).toBeInTheDocument();
  });

  it('renders a custom label when provided', () => {
    // --- Arrange ---
    render(<GoogleAuthButton onClick={vi.fn()} label="Sign up with Google" />);

    // --- Assert ---
    expect(screen.getByText('Sign up with Google')).toBeInTheDocument();
  });

  it('calls onClick exactly once when clicked', async () => {
    // --- Arrange ---
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<GoogleAuthButton onClick={onClick} />);

    // --- Act ---
    await user.click(screen.getByRole('button'));

    // --- Assert ---
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled and shows Redirecting... when isLoading is true', () => {
    // --- Arrange ---
    render(<GoogleAuthButton onClick={vi.fn()} isLoading={true} />);
    const btn = screen.getByRole('button');

    // --- Assert ---
    expect(btn).toBeDisabled();
    expect(screen.getByText('Redirecting...')).toBeInTheDocument();
  });

  it('does not call onClick when disabled', async () => {
    // --- Arrange ---
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<GoogleAuthButton onClick={onClick} isLoading={true} />);

    // --- Act ---
    await user.click(screen.getByRole('button'));

    // --- Assert ---
    expect(onClick).not.toHaveBeenCalled();
  });
});
