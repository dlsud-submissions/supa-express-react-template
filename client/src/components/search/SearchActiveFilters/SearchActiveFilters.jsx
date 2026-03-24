import { X } from 'lucide-react';
import { sectionConfig } from '../../../config/searchConfig';
import styles from './SearchActiveFilters.module.css';

/**
 * Chip strip showing applied sorts and filters below SearchControls.
 * - Sort chips appear on the left, filter chips on the right.
 * - Renders nothing if no filters or sort are active.
 * @param {Object} props
 * @param {string} props.activeSection
 * @param {Object} props.activeFilters
 * @param {Object|null} props.activeSort
 * @param {function} props.onFiltersChange
 * @param {function} props.onSortChange
 * @returns {JSX.Element|null}
 */
const SearchActiveFilters = ({
  activeSection,
  activeFilters,
  activeSort,
  onFiltersChange,
  onSortChange,
}) => {
  const cfg = sectionConfig[activeSection];
  const activeFilterEntries = Object.entries(activeFilters).filter(
    ([, v]) => v
  );

  if (!activeSort && activeFilterEntries.length === 0) return null;

  const getSortLabel = () => {
    const def = cfg.sorts.find((s) => s.key === activeSort?.key);
    return def ? `${def.label} ${activeSort.dir === 'asc' ? '↑' : '↓'}` : null;
  };

  const getFilterLabel = (key) =>
    cfg.filters.find((f) => f.key === key)?.label ?? key;

  const removeFilter = (key) =>
    onFiltersChange({ ...activeFilters, [key]: '' });

  return (
    <div className={styles.strip}>
      {activeSort && (
        <span className={`${styles.chip} ${styles.sortChip}`}>
          {getSortLabel()}
          <button
            className={styles.removeBtn}
            onClick={() => onSortChange(null)}
            aria-label="Remove sort"
          >
            <X size={10} />
          </button>
        </span>
      )}

      {activeSort && activeFilterEntries.length > 0 && (
        <span className={styles.divider} />
      )}

      {activeFilterEntries.map(([key, value]) => (
        <span key={key} className={`${styles.chip} ${styles.filterChip}`}>
          <span className={styles.chipKey}>{getFilterLabel(key)}:</span>
          <span className={styles.chipValue}>{value}</span>
          <button
            className={styles.removeBtn}
            onClick={() => removeFilter(key)}
            aria-label={`Remove ${getFilterLabel(key)} filter`}
          >
            <X size={10} />
          </button>
        </span>
      ))}
    </div>
  );
};

export default SearchActiveFilters;
