import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import GoogleAuthButton from './GoogleAuthButton';

describe('GoogleAuthButton', () => {
  const handleClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the default Google label and logo', () => {
    render(<GoogleAuthButton onClick={handleClick} />);

    expect(
      screen.getByRole('button', { name: /continue with google/i })
    ).toBeInTheDocument();
    expect(document.querySelector('svg')).toBeInTheDocument();
  });

  it('calls onClick exactly once when pressed', async () => {
    const user = userEvent.setup();
    render(<GoogleAuthButton onClick={handleClick} />);

    await user.click(
      screen.getByRole('button', { name: /continue with google/i })
    );

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders a custom label when provided', () => {
    render(
      <GoogleAuthButton onClick={handleClick} label="Sign up with Google" />
    );

    expect(
      screen.getByRole('button', { name: /sign up with google/i })
    ).toBeInTheDocument();
  });

  it('disables the button and shows a loading indicator when loading', () => {
    render(<GoogleAuthButton onClick={handleClick} isLoading />);

    const button = screen.getByRole('button', {
      name: /continue with google/i,
    });

    expect(button).toBeDisabled();
    expect(screen.getByText(/connecting to google/i)).toBeInTheDocument();
    expect(document.querySelector('svg')).not.toBeInTheDocument();
  });
});
