import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router';
import { searchApi } from '../../modules/api/search/search.api';
import { sectionConfig } from '../../config/searchConfig';
import SearchSidebar from '../../components/search/SearchSidebar/SearchSidebar';
import SearchControls from '../../components/search/SearchControls/SearchControls';
import SearchActiveFilters from '../../components/search/SearchActiveFilters/SearchActiveFilters';
import TableContainer from '../../components/tables/TableContainer/TableContainer';
import UserRow from '../../components/tables/user/UserRow/UserRow';
import Spinner from '../../components/feedback/Spinner/Spinner';
import styles from './SearchPage.module.css';

// Map section keys to their row renderer — extend as new sections are added
const rowRenderers = {
  users: (item, onUpdate) => (
    <UserRow key={item.id} user={item} onUpdate={onUpdate} />
  ),
};

/**
 * Search page — all state lives in the URL via useSearchParams.
 * - section, q, sortBy, sortDir, view, and filter values are URL params.
 * - Fires a new API call whenever params change.
 * @returns {JSX.Element}
 */
const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const activeSection = searchParams.get('section') || 'users';
  const q = searchParams.get('q') || '';
  const sortBy = searchParams.get('sortBy') || null;
  const sortDir = searchParams.get('sortDir') || 'desc';
  const activeView = searchParams.get('view') || 'table';

  const cfg = sectionConfig[activeSection];

  // Rebuild activeFilters from URL params on every render
  const activeFilters = Object.fromEntries(
    cfg.filters.map((f) => [f.key, searchParams.get(f.key) || ''])
  );

  const activeSort = sortBy ? { key: sortBy, dir: sortDir } : null;

  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fires the search API and updates results state.
   */
  const runSearch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const activeFilterParams = Object.fromEntries(
        Object.entries(activeFilters).filter(([, v]) => v)
      );
      const response = await searchApi.search({
        section: activeSection,
        q,
        ...(sortBy && { sortBy, sortDir }),
        ...activeFilterParams,
      });

      if (!response.ok) throw new Error('Search failed');
      const data = await response.json();
      setResults(data.results || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    runSearch();
  }, [runSearch]);

  /**
   * Merges updates into current URL params, deleting null/empty values.
   * @param {Object} updates
   */
  const updateParams = (updates) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([k, v]) => {
      if (v === null || v === '') {
        next.delete(k);
      } else {
        next.set(k, v);
      }
    });
    setSearchParams(next);
  };

  const handleSectionChange = (section) => {
    // Clear filters and sort when switching sections; preserve q and view
    setSearchParams({ section, q, view: activeView });
  };

  const handleSortChange = (sort) => {
    if (!sort) {
      updateParams({ sortBy: null, sortDir: null });
    } else {
      updateParams({ sortBy: sort.key, sortDir: sort.dir });
    }
  };

  const handleViewChange = (view) => {
    updateParams({ view });
  };

  const renderRow = (item) =>
    rowRenderers[activeSection]?.(item, runSearch) ?? null;

  return (
    <div className={`${styles.page} animate-fade-in`}>
      <div className={styles.layout}>
        <SearchSidebar
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
        />

        <div className={styles.main}>
          {q && (
            <p className={styles.queryLabel}>
              Results for <span className={styles.queryTerm}>"{q}"</span>
            </p>
          )}

          <SearchControls
            sectionCfg={cfg}
            activeFilters={activeFilters}
            activeSort={activeSort}
            activeView={activeView}
            onFiltersChange={updateParams}
            onSortChange={handleSortChange}
            onViewChange={handleViewChange}
          />

          <SearchActiveFilters
            activeSection={activeSection}
            activeFilters={activeFilters}
            activeSort={activeSort}
            onFiltersChange={updateParams}
            onSortChange={handleSortChange}
          />

          <div className={styles.results}>
            {isLoading ? (
              <div className={styles.centered}>
                <Spinner size="2rem" />
              </div>
            ) : error ? (
              <div className={styles.centered}>
                <p className={styles.error}>{error}</p>
              </div>
            ) : (
              <TableContainer
                data={results}
                columns={cfg.columns}
                renderRow={renderRow}
                emptyMessage={cfg.emptyMessage}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
