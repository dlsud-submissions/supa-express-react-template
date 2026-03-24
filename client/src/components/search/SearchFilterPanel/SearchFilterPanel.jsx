import styles from './SearchFilterPanel.module.css';

/**
 * Popover panel for applying section-specific filters.
 * - Renders each filter based on its type ('select' | 'date').
 * - Calls onChange with the full updated filters object on any change.
 * @param {Object} props
 * @param {Array} props.filters - Filter definitions from sectionConfig.
 * @param {Object} props.activeFilters - Current filter key/value state.
 * @param {function} props.onChange - Called with updated filters object.
 * @param {function} props.onClose - Called when the panel should close.
 * @returns {JSX.Element}
 */
const SearchFilterPanel = ({ filters, activeFilters, onChange, onClose }) => {
  const handleChange = (key, value) => {
    onChange({ ...activeFilters, [key]: value });
  };

  const handleClearAll = () => {
    onChange(Object.fromEntries(filters.map((f) => [f.key, ''])));
  };

  return (
    <div className={`${styles.panel} animate-slide-up`}>
      <div className={styles.header}>
        <span className={styles.title}>Filters</span>
        <button className={styles.clearBtn} onClick={handleClearAll}>
          Clear all
        </button>
      </div>

      <div className={styles.fields}>
        {filters.map((filter) => (
          <div key={filter.key} className={styles.field}>
            <label className={styles.label} htmlFor={`filter-${filter.key}`}>
              {filter.label}
            </label>

            {filter.type === 'select' && (
              <select
                id={`filter-${filter.key}`}
                className={styles.input}
                value={activeFilters[filter.key] || ''}
                onChange={(e) => handleChange(filter.key, e.target.value)}
              >
                <option value="">Any</option>
                {filter.options.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            )}

            {filter.type === 'date' && (
              <input
                id={`filter-${filter.key}`}
                type="date"
                className={styles.input}
                value={activeFilters[filter.key] || ''}
                onChange={(e) => handleChange(filter.key, e.target.value)}
              />
            )}
          </div>
        ))}
      </div>

      <button className={styles.applyBtn} onClick={onClose}>
        Apply
      </button>
    </div>
  );
};

export default SearchFilterPanel;
