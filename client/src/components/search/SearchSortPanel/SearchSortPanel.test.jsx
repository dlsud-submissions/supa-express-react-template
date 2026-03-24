import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../modules/utils/testing/testing.utils';
import SearchSortPanel from './SearchSortPanel';
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

describe('SearchSortPanel Component', () => {
  const baseProps = {
    sorts: sectionConfig.users.sorts,
    activeSort: null,
    onChange: vi.fn(),
    onClose: vi.fn(),
  };

  it('renders all sort property options', () => {
    render(<SearchSortPanel {...baseProps} />);
    expect(screen.getByText(/username/i)).toBeInTheDocument();
    expect(screen.getByText(/date joined/i)).toBeInTheDocument();
    expect(screen.getByText(/last login/i)).toBeInTheDocument();
  });

  it('calls onChange with selected key and default desc on property click', async () => {
    // --- Arrange ---
    const user = userEvent.setup();
    const onChange = vi.fn();

    // --- Act ---
    render(<SearchSortPanel {...baseProps} onChange={onChange} />);
    await user.click(screen.getByText(/date joined/i));

    // --- Assert ---
    expect(onChange).toHaveBeenCalledWith({ key: 'createdAt', dir: 'desc' });
  });

  it('shows the active sort row with a direction chip when a sort is active', () => {
    // --- Arrange ---
    render(
      <SearchSortPanel
        {...baseProps}
        activeSort={{ key: 'createdAt', dir: 'desc' }}
      />
    );

    // --- Assert ---
    expect(screen.getByText('Descending')).toBeInTheDocument();
  });

  it('opens the direction dropdown when the direction chip is clicked', async () => {
    // --- Arrange ---
    const user = userEvent.setup();

    // --- Act ---
    render(
      <SearchSortPanel
        {...baseProps}
        activeSort={{ key: 'createdAt', dir: 'desc' }}
      />
    );
    await user.click(screen.getByRole('button', { name: /descending/i }));

    // --- Assert ---
    expect(screen.getAllByText(/ascending/i).length).toBeGreaterThan(0);
  });

  it('calls onChange with asc direction when Ascending is selected from dropdown', async () => {
    // --- Arrange ---
    const user = userEvent.setup();
    const onChange = vi.fn();

    // --- Act ---
    render(
      <SearchSortPanel
        {...baseProps}
        activeSort={{ key: 'createdAt', dir: 'desc' }}
        onChange={onChange}
      />
    );
    // Open the direction dropdown
    await user.click(screen.getByRole('button', { name: /descending/i }));
    // Click the Ascending option in the dropdown (role="option")
    const options = screen.getAllByRole('option');
    const ascOption = options.find((el) => el.textContent === 'Ascending');
    await user.click(ascOption);

    // --- Assert ---
    expect(onChange).toHaveBeenCalledWith({ key: 'createdAt', dir: 'asc' });
  });

  it('calls onChange with null and onClose when Clear is clicked', async () => {
    // --- Arrange ---
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onClose = vi.fn();

    // --- Act ---
    render(
      <SearchSortPanel
        {...baseProps}
        activeSort={{ key: 'username', dir: 'asc' }}
        onChange={onChange}
        onClose={onClose}
      />
    );
    await user.click(screen.getByText(/clear/i));

    // --- Assert ---
    expect(onChange).toHaveBeenCalledWith(null);
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onClose when Done is clicked without changing the sort', async () => {
    // --- Arrange ---
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onClose = vi.fn();

    // --- Act ---
    render(
      <SearchSortPanel
        {...baseProps}
        activeSort={{ key: 'username', dir: 'desc' }}
        onChange={onChange}
        onClose={onClose}
      />
    );
    await user.click(screen.getByRole('button', { name: /done/i }));

    // --- Assert ---
    expect(onClose).toHaveBeenCalled();
    expect(onChange).not.toHaveBeenCalled();
  });
});
