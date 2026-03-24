/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Spinner from './Spinner';

describe('Spinner Component', () => {
  it('renders successfully with accessible role', () => {
    // --- Act ---
    render(<Spinner />);

    // --- Assert ---
    // Check for the ARIA role status
    expect(screen.getByRole('status')).toBeInTheDocument();
    // Default fallback text for screen readers
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('displays the provided message and omits sr-only text', () => {
    // --- Arrange ---
    const testMessage = 'Fetching data...';

    // --- Act ---
    render(<Spinner message={testMessage} />);

    // --- Assert ---
    // Check that the visible message is present
    expect(screen.getByText(testMessage)).toBeInTheDocument();
    // Ensure the default "Loading..." sr-only text is NOT there to avoid double-announcing
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });

  it('applies custom size via props', () => {
    // --- Arrange ---
    const customSize = '64px';

    // --- Act ---
    render(<Spinner size={customSize} />);
    // Access the actual animated div inside the wrapper
    const spinnerGraphic = screen.getByRole('status').firstElementChild;

    // --- Assert ---
    expect(spinnerGraphic).toHaveStyle({
      width: customSize,
      height: customSize,
    });
  });
});
