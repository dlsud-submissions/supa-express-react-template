import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../modules/utils/testing/testing.utils';
import SearchControls from './SearchControls';
import { sectionConfig } from '../../../config/searchConfig';

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

describe('SearchControls Component', () => {
  const baseProps = {
    sectionCfg: sectionConfig.users,
    activeFilters: { role: '', joinedAfter: '', joinedBefore: '' },
    activeSort: null,
    activeView: 'table',
    onFiltersChange: vi.fn(),
    onSortChange: vi.fn(),
    onViewChange: vi.fn(),
  };

  it('renders Filter, Sort buttons and the view selector', () => {
    // --- Arrange ---
    // --- Act ---
    render(<SearchControls {...baseProps} />);

    // --- Assert ---
    expect(screen.getByLabelText(/toggle filters/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/toggle sort/i)).toBeInTheDocument();
    expect(
      screen.getByRole('group', { name: /view mode/i })
    ).toBeInTheDocument();
  });

  it('shows the filter panel on Filter button click', async () => {
    // --- Arrange ---
    const user = userEvent.setup();

    // --- Act ---
    render(<SearchControls {...baseProps} />);
    await user.click(screen.getByLabelText(/toggle filters/i));

    // --- Assert ---
    expect(screen.getByText(/^filters$/i)).toBeInTheDocument();
  });

  it('shows the sort panel on Sort button click', async () => {
    // --- Arrange ---
    const user = userEvent.setup();

    // --- Act ---
    render(<SearchControls {...baseProps} />);
    await user.click(screen.getByLabelText(/toggle sort/i));

    // --- Assert ---
    expect(screen.getByText(/sort by/i)).toBeInTheDocument();
  });

  it('hides sort panel when filter panel is opened and vice versa', async () => {
    // --- Arrange ---
    const user = userEvent.setup();
    render(<SearchControls {...baseProps} />);

    // --- Act ---
    await user.click(screen.getByLabelText(/toggle sort/i));
    await user.click(screen.getByLabelText(/toggle filters/i));

    // --- Assert ---
    // Sort panel should be gone, filter panel should be open
    expect(screen.queryByText(/sort by/i)).not.toBeInTheDocument();
    expect(screen.getByText(/^filters$/i)).toBeInTheDocument();
  });

  it('shows an active badge on Filter button when filters are applied', () => {
    // --- Arrange ---
    // --- Act ---
    render(
      <SearchControls
        {...baseProps}
        activeFilters={{ role: 'ADMIN', joinedAfter: '', joinedBefore: '' }}
      />
    );

    // --- Assert ---
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('calls onViewChange when a view button is clicked', async () => {
    // --- Arrange ---
    const user = userEvent.setup();
    const onViewChange = vi.fn();

    // --- Act ---
    render(<SearchControls {...baseProps} onViewChange={onViewChange} />);
    await user.click(screen.getByLabelText(/table view/i));

    // --- Assert ---
    expect(onViewChange).toHaveBeenCalledWith('table');
  });
});
