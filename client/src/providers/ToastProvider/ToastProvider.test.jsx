import { render, screen, act, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { ToastProvider, useToast } from './ToastProvider.jsx';

/**
 * Helper component to trigger toasts during testing.
 * @param {Object} props - Component props.
 * @param {string} props.message - Toast message.
 * @param {string} props.type - Toast type.
 */
const TestTrigger = ({ message, type }) => {
  const { showToast } = useToast();
  return <button onClick={() => showToast(message, type)}>Trigger</button>;
};

describe('ToastProvider', () => {
  it('displays a toast when showToast is called', async () => {
    // --- Arrange ---
    const user = userEvent.setup();

    render(
      <ToastProvider>
        <TestTrigger message="Success Alert" type="success" />
      </ToastProvider>
    );

    // --- Act ---
    const button = screen.getByRole('button', { name: /trigger/i });
    await user.click(button);

    // --- Assert ---
    expect(screen.getByText('Success Alert')).toBeDefined();
  });

  it('removes the toast automatically after 3000ms', () => {
    // --- Arrange ---
    // Use fake timers for synchronous time control
    vi.useFakeTimers();

    render(
      <ToastProvider>
        <TestTrigger message="Temporary Message" type="info" />
      </ToastProvider>
    );

    // --- Act ---
    // Use fireEvent here to avoid the async hang caused by userEvent + fakeTimers
    const button = screen.getByRole('button', { name: /trigger/i });
    fireEvent.click(button);

    // Verify initial state
    expect(screen.queryByText('Temporary Message')).not.toBeNull();

    // Advance clock by 3 seconds
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    // --- Assert ---
    // Verify removal
    expect(screen.queryByText('Temporary Message')).toBeNull();

    // Cleanup
    vi.useRealTimers();
  });
});
