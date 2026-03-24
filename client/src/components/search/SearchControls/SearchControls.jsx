import { useState } from 'react';
import { SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import SearchFilterPanel from '../SearchFilterPanel/SearchFilterPanel';
import SearchSortPanel from '../SearchSortPanel/SearchSortPanel';
import SearchViewSelector from '../SearchViewSelector/SearchViewSelector';
import styles from './SearchControls.module.css';

/**
 * Toolbar above search results.
 * - Left: Filter and Sort buttons with their popovers.
 * - Right: View mode selector (Table / Gallery / List).
 * - Filter button badge shows count of active filters.
 * - Both Filter and Sort buttons highlight when active.
 * @param {Object} props
 * @param {Object} props.sectionCfg - Config for the active section.
 * @param {Object} props.activeFilters - Currently applied filter key/value pairs.
 * @param {Object|null} props.activeSort - Current sort { key, dir } or null.
 * @param {string} props.activeView - Current view mode key.
 * @param {function} props.onFiltersChange - Called with updated filters object.
 * @param {function} props.onSortChange - Called with updated sort or null.
 * @param {function} props.onViewChange - Called with new view key.
 * @returns {JSX.Element}
 */
const SearchControls = ({
  sectionCfg,
  activeFilters,
  activeSort,
  activeView,
  onFiltersChange,
  onSortChange,
  onViewChange,
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [showSort, setShowSort] = useState(false);

  const hasActiveFilters = Object.values(activeFilters).some(Boolean);
  const activeFilterCount = Object.values(activeFilters).filter(Boolean).length;

  return (
    <div className={styles.controls}>
      <div className={styles.buttonGroup}>
        {/* Filter button + panel */}
        <div className={styles.popoverWrapper}>
          <button
            className={`${styles.controlBtn} ${hasActiveFilters ? styles.active : ''}`}
            onClick={() => {
              setShowFilters(!showFilters);
              setShowSort(false);
            }}
            aria-label="Toggle filters"
          >
            <SlidersHorizontal size={14} />
            <span>Filter</span>
            {hasActiveFilters && (
              <span className={styles.badge}>{activeFilterCount}</span>
            )}
          </button>

          {showFilters && (
            <SearchFilterPanel
              filters={sectionCfg.filters}
              activeFilters={activeFilters}
              onChange={onFiltersChange}
              onClose={() => setShowFilters(false)}
            />
          )}
        </div>

        {/* Sort button + panel */}
        <div className={styles.popoverWrapper}>
          <button
            className={`${styles.controlBtn} ${activeSort ? styles.active : ''}`}
            onClick={() => {
              setShowSort(!showSort);
              setShowFilters(false);
            }}
            aria-label="Toggle sort"
          >
            <ArrowUpDown size={14} />
            <span>Sort</span>
          </button>

          {showSort && (
            <SearchSortPanel
              sorts={sectionCfg.sorts}
              activeSort={activeSort}
              onChange={onSortChange}
              onClose={() => setShowSort(false)}
            />
          )}
        </div>
      </div>

      {/* Right side: view mode selector */}
      <SearchViewSelector activeView={activeView} onViewChange={onViewChange} />
    </div>
  );
};

export default SearchControls;
