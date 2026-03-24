import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../modules/utils/testing/testing.utils';
import SearchActiveFilters from './SearchActiveFilters';

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

describe('SearchActiveFilters Component', () => {
  const baseProps = {
    activeSection: 'users',
    activeFilters: { role: '', joinedAfter: '', joinedBefore: '' },
    activeSort: null,
    onFiltersChange: vi.fn(),
    onSortChange: vi.fn(),
  };

  it('renders nothing when no filters or sort are active', () => {
    // --- Arrange ---
    // --- Act ---
    render(<SearchActiveFilters {...baseProps} />);

    // --- Assert ---
    // customRender always adds a wrapper div — query for the strip itself, not container.firstChild
    expect(screen.queryByLabelText(/remove sort/i)).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /remove/i })
    ).not.toBeInTheDocument();
  });

  it('renders a sort chip when activeSort is set', () => {
    // --- Arrange ---
    // --- Act ---
    render(
      <SearchActiveFilters
        {...baseProps}
        activeSort={{ key: 'createdAt', dir: 'desc' }}
      />
    );

    // --- Assert ---
    // The chip text is "Date Joined ↓" as a single node — match the whole string
    expect(screen.getByLabelText(/remove sort/i)).toBeInTheDocument();
    expect(
      screen.getByText(
        (content) => content.includes('Date Joined') && content.includes('↓')
      )
    ).toBeInTheDocument();
  });

  it('renders a filter chip for each active filter', () => {
    render(
      <SearchActiveFilters
        {...baseProps}
        activeFilters={{ role: 'ADMIN', joinedAfter: '', joinedBefore: '' }}
      />
    );
    expect(screen.getByText('ADMIN')).toBeInTheDocument();
  });

  it('calls onSortChange with null when the sort chip X is clicked', async () => {
    // --- Arrange ---
    const user = userEvent.setup();
    const onSortChange = vi.fn();

    // --- Act ---
    render(
      <SearchActiveFilters
        {...baseProps}
        activeSort={{ key: 'createdAt', dir: 'desc' }}
        onSortChange={onSortChange}
      />
    );
    await user.click(screen.getByLabelText(/remove sort/i));

    // --- Assert ---
    expect(onSortChange).toHaveBeenCalledWith(null);
  });

  it('calls onFiltersChange with the filter cleared when a filter chip X is clicked', async () => {
    // --- Arrange ---
    const user = userEvent.setup();
    const onFiltersChange = vi.fn();

    // --- Act ---
    render(
      <SearchActiveFilters
        {...baseProps}
        activeFilters={{ role: 'ADMIN', joinedAfter: '', joinedBefore: '' }}
        onFiltersChange={onFiltersChange}
      />
    );
    await user.click(screen.getByLabelText(/remove role filter/i));

    // --- Assert ---
    expect(onFiltersChange).toHaveBeenCalledWith(
      expect.objectContaining({ role: '' })
    );
  });
});
