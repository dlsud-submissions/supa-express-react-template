import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../modules/utils/testing/testing.utils';
import SearchFilterPanel from './SearchFilterPanel';
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

describe('SearchFilterPanel Component', () => {
  const baseProps = {
    filters: sectionConfig.users.filters,
    activeFilters: { role: '', joinedAfter: '', joinedBefore: '' },
    onChange: vi.fn(),
    onClose: vi.fn(),
  };

  it('renders a field for each filter in the section config', () => {
    // --- Arrange ---
    // --- Act ---
    render(<SearchFilterPanel {...baseProps} />);

    // --- Assert ---
    expect(screen.getByLabelText(/role/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/joined after/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/joined before/i)).toBeInTheDocument();
  });

  it('calls onChange with updated value when a select filter changes', async () => {
    // --- Arrange ---
    const user = userEvent.setup();
    const onChange = vi.fn();

    // --- Act ---
    render(<SearchFilterPanel {...baseProps} onChange={onChange} />);
    await user.selectOptions(screen.getByLabelText(/role/i), 'ADMIN');

    // --- Assert ---
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ role: 'ADMIN' })
    );
  });

  it('calls onChange with all filters cleared on Clear all click', async () => {
    // --- Arrange ---
    const user = userEvent.setup();
    const onChange = vi.fn();

    // --- Act ---
    render(
      <SearchFilterPanel
        {...baseProps}
        activeFilters={{
          role: 'ADMIN',
          joinedAfter: '2024-01-01',
          joinedBefore: '',
        }}
        onChange={onChange}
      />
    );
    await user.click(screen.getByText(/clear all/i));

    // --- Assert ---
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ role: '', joinedAfter: '', joinedBefore: '' })
    );
  });

  it('calls onClose when Apply is clicked', async () => {
    // --- Arrange ---
    const user = userEvent.setup();
    const onClose = vi.fn();

    // --- Act ---
    render(<SearchFilterPanel {...baseProps} onClose={onClose} />);
    await user.click(screen.getByRole('button', { name: /apply/i }));

    // --- Assert ---
    expect(onClose).toHaveBeenCalled();
  });

  it('renders the Filters panel title', () => {
    // --- Arrange ---
    // --- Act ---
    render(<SearchFilterPanel {...baseProps} />);

    // --- Assert ---
    expect(screen.getByText(/^filters$/i)).toBeInTheDocument();
  });

  it('pre-fills select input with the current active filter value', () => {
    // --- Arrange ---
    // --- Act ---
    render(
      <SearchFilterPanel
        {...baseProps}
        activeFilters={{ role: 'ADMIN', joinedAfter: '', joinedBefore: '' }}
      />
    );

    // --- Assert ---
    expect(screen.getByLabelText(/role/i)).toHaveValue('ADMIN');
  });
});
