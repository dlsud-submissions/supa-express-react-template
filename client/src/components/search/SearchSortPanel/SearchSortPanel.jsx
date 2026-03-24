import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import styles from './SearchSortPanel.module.css';

/**
 * Popover panel for selecting sort field and direction.
 * - Property name shown as a chip; click to change property.
 * - Direction shown as a dropdown chip (Ascending / Descending) — Notion-style.
 * - Done closes the panel; Clear removes the sort.
 * @param {Object} props
 * @param {Array} props.sorts - Sort definitions from sectionConfig.
 * @param {Object|null} props.activeSort - Current { key, dir } or null.
 * @param {function} props.onChange - Called with new sort or null.
 * @param {function} props.onClose - Called to close the panel.
 */
const SearchSortPanel = ({ sorts, activeSort, onChange, onClose }) => {
  const [dirOpen, setDirOpen] = useState(false);
  const dirRef = useRef(null);

  // Close direction dropdown on outside click
  useEffect(() => {
    if (!dirOpen) return;
    const handler = (e) => {
      if (dirRef.current && !dirRef.current.contains(e.target)) {
        setDirOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [dirOpen]);

  const handleSelect = (key) => {
    if (activeSort?.key !== key) {
      onChange({ key, dir: 'desc' });
    }
  };

  const handleDirSelect = (dir) => {
    if (activeSort) onChange({ ...activeSort, dir });
    setDirOpen(false);
  };

  const handleClear = () => {
    onChange(null);
    onClose();
  };

  const activeSortDef = sorts.find((s) => s.key === activeSort?.key);

  return (
    <div className={`${styles.panel} animate-slide-up`}>
      <div className={styles.header}>
        <span className={styles.title}>Sort by</span>
        {activeSort && (
          <button className={styles.clearBtn} onClick={handleClear}>
            Clear
          </button>
        )}
      </div>

      {/* Active sort row — Notion style */}
      {activeSort && activeSortDef && (
        <div className={styles.activeRow}>
          {/* Property chip — read-only label, can click options below to change */}
          <span className={styles.propChip}>{activeSortDef.label}</span>

          {/* Direction dropdown chip */}
          <div className={styles.dirDropdownWrapper} ref={dirRef}>
            <button
              className={`${styles.dirChip} ${dirOpen ? styles.dirChipOpen : ''}`}
              onClick={() => setDirOpen((v) => !v)}
              aria-haspopup="listbox"
              aria-expanded={dirOpen}
            >
              <span>
                {activeSort.dir === 'asc' ? 'Ascending' : 'Descending'}
              </span>
              <ChevronDown
                size={12}
                className={dirOpen ? styles.chevronOpen : ''}
              />
            </button>

            {dirOpen && (
              <div
                className={`${styles.dirMenu} animate-slide-up`}
                role="listbox"
              >
                <button
                  role="option"
                  aria-selected={activeSort.dir === 'asc'}
                  className={`${styles.dirOption} ${activeSort.dir === 'asc' ? styles.dirOptionActive : ''}`}
                  onClick={() => handleDirSelect('asc')}
                >
                  Ascending
                </button>
                <button
                  role="option"
                  aria-selected={activeSort.dir === 'desc'}
                  className={`${styles.dirOption} ${activeSort.dir === 'desc' ? styles.dirOptionActive : ''}`}
                  onClick={() => handleDirSelect('desc')}
                >
                  Descending
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Property list */}
      <div className={styles.options}>
        {sorts.map((sort) => {
          const isActive = activeSort?.key === sort.key;
          return (
            <button
              key={sort.key}
              className={`${styles.option} ${isActive ? styles.activeOption : ''}`}
              onClick={() => handleSelect(sort.key)}
            >
              {sort.label}
            </button>
          );
        })}
      </div>

      <button className={styles.doneBtn} onClick={onClose}>
        Done
      </button>
    </div>
  );
};

export default SearchSortPanel;
