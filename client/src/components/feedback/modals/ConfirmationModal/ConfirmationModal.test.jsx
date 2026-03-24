import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import {
  render,
  screen,
} from '../../../../modules/utils/testing/testing.utils';
import ConfirmationModal from './ConfirmationModal';

// Mock AuthProvider to prevent background auth checks from causing act() warnings
vi.mock(
  '../../../../providers/AuthProvider/AuthProvider',
  async (importOriginal) => {
    const actual = await importOriginal();
    return {
      ...actual,
      useAuth: vi.fn(),
      AuthProvider: ({ children }) => children,
    };
  }
);

describe('ConfirmationModal Component', () => {
  const baseProps = {
    isOpen: true,
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
    title: 'Confirm Action',
    message: 'Are you sure you want to proceed?',
  };

  it('renders nothing when isOpen is false', () => {
    // --- Arrange ---
    // --- Act ---
    render(<ConfirmationModal {...baseProps} isOpen={false} />);

    // --- Assert ---
    expect(screen.queryByText('Confirm Action')).not.toBeInTheDocument();
  });

  it('renders title, message, and default labels when open', () => {
    // --- Arrange ---
    // --- Act ---
    render(<ConfirmationModal {...baseProps} />);

    // --- Assert ---
    expect(screen.getByText('Confirm Action')).toBeInTheDocument();
    expect(
      screen.getByText('Are you sure you want to proceed?')
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /confirm/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('renders custom confirm and cancel labels when provided', () => {
    // --- Arrange ---
    // --- Act ---
    render(
      <ConfirmationModal
        {...baseProps}
        confirmLabel="Logout"
        cancelLabel="Go Back"
      />
    );

    // --- Assert ---
    expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /go back/i })
    ).toBeInTheDocument();
  });

  it('calls onConfirm when the confirm button is clicked', async () => {
    // --- Arrange ---
    const user = userEvent.setup();
    const onConfirm = vi.fn();

    // --- Act ---
    render(<ConfirmationModal {...baseProps} onConfirm={onConfirm} />);
    await user.click(screen.getByRole('button', { name: /confirm/i }));

    // --- Assert ---
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when the cancel button is clicked', async () => {
    // --- Arrange ---
    const user = userEvent.setup();
    const onCancel = vi.fn();

    // --- Act ---
    render(<ConfirmationModal {...baseProps} onCancel={onCancel} />);
    await user.click(screen.getByRole('button', { name: /cancel/i }));

    // --- Assert ---
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when the overlay backdrop is clicked', async () => {
    // --- Arrange ---
    const user = userEvent.setup();
    const onCancel = vi.fn();

    // --- Act ---
    render(<ConfirmationModal {...baseProps} onCancel={onCancel} />);
    // Click the overlay directly, not the modal content
    await user.click(
      screen.getByText('Confirm Action').closest('[class*="modalOverlay"]')
    );

    // --- Assert ---
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('does not call onCancel when clicking inside the modal content', async () => {
    // --- Arrange ---
    const user = userEvent.setup();
    const onCancel = vi.fn();

    // --- Act ---
    render(<ConfirmationModal {...baseProps} onCancel={onCancel} />);
    await user.click(screen.getByText('Are you sure you want to proceed?'));

    // --- Assert ---
    expect(onCancel).not.toHaveBeenCalled();
  });
});
