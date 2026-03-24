import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../modules/utils/testing/testing.utils';
import SearchViewSelector from './SearchViewSelector';

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

describe('SearchViewSelector Component', () => {
  const baseProps = {
    activeView: 'table',
    onViewChange: vi.fn(),
  };

  it('renders view buttons for all defined views', () => {
    // --- Arrange ---
    // --- Act ---
    render(<SearchViewSelector {...baseProps} />);

    // --- Assert ---
    expect(screen.getByLabelText(/table view/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/gallery view/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/list view/i)).toBeInTheDocument();
  });

  it('marks the active view button as pressed', () => {
    // --- Arrange ---
    // --- Act ---
    render(<SearchViewSelector {...baseProps} />);

    // --- Assert ---
    expect(screen.getByLabelText(/table view/i)).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    expect(screen.getByLabelText(/gallery view/i)).toHaveAttribute(
      'aria-pressed',
      'false'
    );
  });

  it('calls onViewChange with table key when table is clicked', async () => {
    // --- Arrange ---
    const user = userEvent.setup();
    const onViewChange = vi.fn();

    // --- Act ---
    render(<SearchViewSelector {...baseProps} onViewChange={onViewChange} />);
    await user.click(screen.getByLabelText(/table view/i));

    // --- Assert ---
    expect(onViewChange).toHaveBeenCalledWith('table');
  });

  it('does not call onViewChange when a disabled view is clicked', async () => {
    // --- Arrange ---
    const user = userEvent.setup();
    const onViewChange = vi.fn();

    // --- Act ---
    render(<SearchViewSelector {...baseProps} onViewChange={onViewChange} />);
    await user.click(screen.getByLabelText(/gallery view/i));

    // --- Assert ---
    expect(onViewChange).not.toHaveBeenCalled();
  });

  it('shows coming soon in title for disabled views', () => {
    // --- Arrange ---
    // --- Act ---
    render(<SearchViewSelector {...baseProps} />);

    // --- Assert ---
    expect(
      screen.getByLabelText(/gallery view \(coming soon\)/i)
    ).toBeInTheDocument();
  });
});
