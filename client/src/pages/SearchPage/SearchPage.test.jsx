import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Routes, Route } from 'react-router';
import {
  render,
  screen,
  waitFor,
} from '../../modules/utils/testing/testing.utils';
import { useAuth } from '../../providers/AuthProvider/AuthProvider';
import SearchPage from './SearchPage';

vi.mock('../../providers/AuthProvider/AuthProvider', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useAuth: vi.fn(),
    AuthProvider: ({ children }) => children,
  };
});

vi.mock('../../modules/api/search/search.api', () => ({
  searchApi: { search: vi.fn() },
}));

import { searchApi } from '../../modules/api/search/search.api';

describe('SearchPage Component', () => {
  beforeEach(() => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 1, username: 'admin', role: 'ADMIN' },
    });
  });

  it('shows loading spinner while fetching', () => {
    // --- Arrange ---
    vi.mocked(searchApi.search).mockImplementation(() => new Promise(() => {}));

    // --- Act ---
    render(
      <Routes>
        <Route path="/search" element={<SearchPage />} />
      </Routes>,
      { initialEntries: ['/search?section=users'] }
    );

    // --- Assert ---
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders results after a successful fetch', async () => {
    // --- Arrange ---
    const mockResults = [
      {
        id: 1,
        username: 'alice',
        role: 'USER',
        createdAt: '2024-01-01T00:00:00Z',
      },
    ];
    vi.mocked(searchApi.search).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ section: 'users', results: mockResults }),
    });

    // --- Act ---
    render(
      <Routes>
        <Route path="/search" element={<SearchPage />} />
      </Routes>,
      { initialEntries: ['/search?section=users'] }
    );

    // --- Assert ---
    await waitFor(() => {
      expect(screen.getByText('alice')).toBeInTheDocument();
    });
  });

  it('renders the query label when q is in the URL', async () => {
    // --- Arrange ---
    vi.mocked(searchApi.search).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ section: 'users', results: [] }),
    });

    // --- Act ---
    render(
      <Routes>
        <Route path="/search" element={<SearchPage />} />
      </Routes>,
      { initialEntries: ['/search?section=users&q=alice'] }
    );

    // --- Assert ---
    await waitFor(() => {
      expect(screen.getByText(/"alice"/)).toBeInTheDocument();
    });
  });

  it('shows an error message on fetch failure', async () => {
    // --- Arrange ---
    vi.mocked(searchApi.search).mockResolvedValueOnce({ ok: false });

    // --- Act ---
    render(
      <Routes>
        <Route path="/search" element={<SearchPage />} />
      </Routes>,
      { initialEntries: ['/search?section=users'] }
    );

    // --- Assert ---
    await waitFor(() => {
      expect(screen.getByText(/search failed/i)).toBeInTheDocument();
    });
  });

  it('renders SearchControls with a view selector', async () => {
    // --- Arrange ---
    vi.mocked(searchApi.search).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ section: 'users', results: [] }),
    });

    // --- Act ---
    render(
      <Routes>
        <Route path="/search" element={<SearchPage />} />
      </Routes>,
      { initialEntries: ['/search?section=users'] }
    );

    // --- Assert --- only one view selector (in SearchControls)
    await waitFor(() => {
      expect(screen.getAllByRole('group', { name: /view mode/i })).toHaveLength(
        1
      );
    });
  });
});
