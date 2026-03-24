import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { Routes, Route } from 'react-router';
import { render, screen } from '../../../modules/utils/testing/testing.utils';
import SearchBar from './SearchBar';

// Mock useNavigate at module level — ESM-safe, no spyOn needed
const mockNavigate = vi.fn();
vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

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

describe('SearchBar Component', () => {
  it('renders the search input and form', () => {
    render(<SearchBar />);
    expect(screen.getByRole('search')).toBeInTheDocument();
    expect(screen.getByLabelText(/search/i)).toBeInTheDocument();
  });

  it('pre-fills the input from the URL q param', () => {
    render(<SearchBar />, { initialEntries: ['/search?q=bob'] });
    expect(screen.getByLabelText(/search/i)).toHaveValue('bob');
  });

  it('updates the input value as the user types', async () => {
    // --- Arrange ---
    const user = userEvent.setup();
    render(<SearchBar />);

    // --- Act ---
    await user.type(screen.getByLabelText(/search/i), 'alice');

    // --- Assert ---
    expect(screen.getByLabelText(/search/i)).toHaveValue('alice');
  });

  it('navigates to /search with q param on submit', async () => {
    // --- Arrange ---
    const user = userEvent.setup();
    render(<SearchBar />, { initialEntries: ['/'] });

    // --- Act ---
    const input = screen.getByLabelText(/search/i);
    await user.click(input);
    await user.type(input, 'alice');
    await user.keyboard('{Enter}');

    // --- Assert ---
    expect(mockNavigate).toHaveBeenCalledWith(
      expect.stringContaining('/search')
    );
    expect(mockNavigate).toHaveBeenCalledWith(
      expect.stringContaining('q=alice')
    );
  });

  it('preserves the active section in the URL on submit', async () => {
    // --- Arrange ---
    const user = userEvent.setup();
    mockNavigate.mockClear();
    render(
      <Routes>
        <Route path="/search" element={<SearchBar />} />
      </Routes>,
      { initialEntries: ['/search?section=users'] }
    );

    // --- Act ---
    await user.clear(screen.getByLabelText(/search/i));
    await user.type(screen.getByLabelText(/search/i), 'new query');
    await user.keyboard('{Enter}');

    // --- Assert ---
    expect(mockNavigate).toHaveBeenCalledWith(
      expect.stringContaining('section=users')
    );
  });
});
