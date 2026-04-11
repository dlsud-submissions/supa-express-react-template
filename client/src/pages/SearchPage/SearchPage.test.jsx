import { Route, Routes } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
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
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 'uuid-1', username: 'admin', role: 'ADMIN' },
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
    // Supabase returns snake_case column names
    const mockResults = [
      {
        id: 'uuid-1',
        username: 'alice',
        role: 'USER',
        created_at: '2024-01-01T00:00:00Z',
        last_login: null,
      },
    ];
    vi.mocked(searchApi.search).mockResolvedValueOnce({
      data: mockResults,
      error: null,
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
      data: [],
      error: null,
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

  it('shows an error message when API returns an error', async () => {
    // --- Arrange ---
    vi.mocked(searchApi.search).mockResolvedValueOnce({
      data: null,
      error: { message: 'Search failed' },
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
      expect(screen.getByText(/search failed/i)).toBeInTheDocument();
    });
  });

  it('renders an empty state message when results are empty', async () => {
    // --- Arrange ---
    vi.mocked(searchApi.search).mockResolvedValueOnce({
      data: [],
      error: null,
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
      expect(
        screen.getByText(/no users matched your search/i)
      ).toBeInTheDocument();
    });
  });

  it('calls searchApi with the correct params from the URL', async () => {
    // --- Arrange ---
    vi.mocked(searchApi.search).mockResolvedValueOnce({
      data: [],
      error: null,
    });

    // --- Act ---
    render(
      <Routes>
        <Route path="/search" element={<SearchPage />} />
      </Routes>,
      {
        initialEntries: [
          '/search?section=users&q=bob&sortBy=username&sortDir=asc&role=ADMIN',
        ],
      }
    );

    // --- Assert ---
    await waitFor(() => {
      expect(searchApi.search).toHaveBeenCalledWith(
        expect.objectContaining({
          section: 'users',
          q: 'bob',
          sortBy: 'username',
          sortDir: 'asc',
          role: 'ADMIN',
        })
      );
    });
  });

  it('renders SearchControls with a view selector', async () => {
    // --- Arrange ---
    vi.mocked(searchApi.search).mockResolvedValueOnce({
      data: [],
      error: null,
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
      expect(screen.getAllByRole('group', { name: /view mode/i })).toHaveLength(
        1
      );
    });
  });
});
