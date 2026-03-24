import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import Toast from './Toast';

describe('Toast Component', () => {
  const mockProps = {
    message: 'Test Message',
    type: 'success',
    onClose: vi.fn(),
  };

  it('renders the correct message', () => {
    // --- Act ---
    render(<Toast {...mockProps} />);

    // --- Assert ---
    expect(screen.getByText(/Test Message/i)).toBeInTheDocument();
  });

  it('calls onClose when the close button is clicked', async () => {
    // --- Arrange ---
    const user = userEvent.setup();
    render(<Toast {...mockProps} />);
    const closeButton = screen.getByRole('button', {
      name: /Close notification/i,
    });

    // --- Act ---
    await user.click(closeButton);

    // --- Assert ---
    expect(mockProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('applies the correct CSS class for error types', () => {
    // --- Act ---
    const { container } = render(<Toast {...mockProps} type="error" />);

    // --- Assert ---
    // Validate style application via class name
    expect(container.firstChild.className).toContain('error');
  });
});
