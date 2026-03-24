import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ToastContainer from './ToastContainer';

describe('ToastContainer Component', () => {
  const mockToasts = [
    { id: 1, message: 'Message One', type: 'info' },
    { id: 2, message: 'Message Two', type: 'success' },
    { id: 3, message: 'Message Three', type: 'error' },
  ];

  const mockRemoveToast = vi.fn();

  it('renders the correct number of toast components', () => {
    // --- Act ---
    render(
      <ToastContainer toasts={mockToasts} removeToast={mockRemoveToast} />
    );

    // --- Assert ---
    // Check if all messages are present in the document
    expect(screen.getByText(/Message One/i)).toBeDefined();
    expect(screen.getByText(/Message Two/i)).toBeDefined();
    expect(screen.getByText(/Message Three/i)).toBeDefined();
  });

  it('renders nothing when the toasts array is empty', () => {
    // --- Act ---
    const { container } = render(
      <ToastContainer toasts={[]} removeToast={mockRemoveToast} />
    );

    // --- Assert ---
    // The container div should be empty
    expect(container.firstChild.childNodes.length).toBe(0);
  });
});
