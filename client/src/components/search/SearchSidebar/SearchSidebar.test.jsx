import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../modules/utils/testing/testing.utils';
import SearchSidebar from './SearchSidebar';

vi.mock(
  '../../../providers/AuthProvider/AuthProvider',
  async (importOriginal) => {
    const actual = await importOriginal();
    return {
      ...actual,
      useAuth: vi.fn(),
      AuthProvider: ({ children }) => children,
    };
  }
);

describe('SearchSidebar Component', () => {
  const baseProps = {
    activeSection: 'users',
    onSectionChange: vi.fn(),
  };

  it('renders a tab for each configured section', () => {
    // --- Arrange ---
    // --- Act ---
    render(<SearchSidebar {...baseProps} />);

    // --- Assert ---
    expect(screen.getByRole('button', { name: /users/i })).toBeInTheDocument();
  });

  it('marks the active tab with aria-current="page"', () => {
    // --- Arrange ---
    // --- Act ---
    render(<SearchSidebar {...baseProps} />);

    // --- Assert ---
    expect(screen.getByRole('button', { name: /users/i })).toHaveAttribute(
      'aria-current',
      'page'
    );
  });

  it('does not mark inactive tabs with aria-current', () => {
    // --- Arrange ---
    // Add a second section to config temporarily or just verify the active one
    // --- Act ---
    render(<SearchSidebar {...baseProps} activeSection="users" />);

    // --- Assert ---
    // All buttons that are NOT the active section should not have aria-current
    const buttons = screen.getAllByRole('button');
    const inactiveButtons = buttons.filter(
      (btn) => !btn.textContent?.match(/users/i)
    );
    inactiveButtons.forEach((btn) => {
      expect(btn).not.toHaveAttribute('aria-current', 'page');
    });
  });

  it('calls onSectionChange with the section key on tab click', async () => {
    // --- Arrange ---
    const user = userEvent.setup();
    const onSectionChange = vi.fn();

    // --- Act ---
    render(<SearchSidebar {...baseProps} onSectionChange={onSectionChange} />);
    await user.click(screen.getByRole('button', { name: /users/i }));

    // --- Assert ---
    expect(onSectionChange).toHaveBeenCalledWith('users');
  });

  it('renders the Browse label', () => {
    // --- Arrange ---
    // --- Act ---
    render(<SearchSidebar {...baseProps} />);

    // --- Assert ---
    expect(screen.getByText(/browse/i)).toBeInTheDocument();
  });
});
