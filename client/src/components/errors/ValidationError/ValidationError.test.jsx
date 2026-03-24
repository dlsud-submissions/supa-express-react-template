import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ValidationError from './ValidationError';

describe('ValidationError Component', () => {
  it('should render nothing if no message is provided', () => {
    // --- Arrange ---
    const { container } = render(<ValidationError message="" />);

    // --- Act & Assert ---
    // Ensure the component returns null (empty container)
    expect(container.firstChild).toBeNull();
  });

  it('should display the main summary message', () => {
    // --- Arrange ---
    const testMessage = 'Validation failed';

    // --- Act ---
    render(<ValidationError message={testMessage} />);

    // --- Assert ---
    // Verify the summary paragraph contains the correct text
    const summary = screen.getByText(testMessage);
    expect(summary).toBeDefined();
    expect(summary.tagName).toBe('P');
  });

  it('should render a list of specific error messages when provided', () => {
    // --- Arrange ---
    const testMessage = 'Invalid input';
    const mockErrors = [
      { msg: 'Username too short' },
      { msg: 'Email is invalid' },
    ];

    // --- Act ---
    render(<ValidationError message={testMessage} errors={mockErrors} />);

    // --- Assert ---
    // Verify list items are present for each error object
    const errorItems = screen.getAllByRole('listitem');
    expect(errorItems).toHaveLength(2);
    expect(screen.getByText('Username too short')).toBeDefined();
    expect(screen.getByText('Email is invalid')).toBeDefined();
  });

  it('should not render an unordered list if the errors array is empty', () => {
    // --- Arrange ---
    const testMessage = 'Generic error';

    // --- Act ---
    render(<ValidationError message={testMessage} errors={[]} />);

    // --- Assert ---
    // Ensure the ul element is absent from the DOM
    const list = screen.queryByRole('list');
    expect(list).toBeNull();
  });
});
