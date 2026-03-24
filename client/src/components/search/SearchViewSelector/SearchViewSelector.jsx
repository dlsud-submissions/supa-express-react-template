import { Table, LayoutGrid, List } from 'lucide-react';
import styles from './SearchViewSelector.module.css';

const VIEWS = [
  { key: 'table', Icon: Table, label: 'Table' },
  { key: 'gallery', Icon: LayoutGrid, label: 'Gallery' },
  { key: 'list', Icon: List, label: 'List' },
];

/**
 * Toggle buttons for switching between data view modes.
 * - Only 'table' is currently functional; others are visually disabled.
 * - Extend by adding a renderer to SearchPage.rowRenderers and enabling the view key.
 * @param {Object} props
 * @param {string} props.activeView - Currently selected view key.
 * @param {function} props.onViewChange - Called with the new view key on click.
 * @returns {JSX.Element}
 */
const SearchViewSelector = ({ activeView = 'table', onViewChange }) => (
  <div className={styles.selector} role="group" aria-label="View mode">
    {VIEWS.map(({ key, Icon, label }) => {
      const isActive = activeView === key;
      const isDisabled = key !== 'table';
      return (
        <button
          key={key}
          className={`${styles.viewBtn} ${isActive ? styles.active : ''} ${isDisabled ? styles.disabled : ''}`}
          onClick={() => !isDisabled && onViewChange(key)}
          aria-label={`${label} view${isDisabled ? ' (coming soon)' : ''}`}
          aria-pressed={isActive}
          title={isDisabled ? `${label} (coming soon)` : label}
          disabled={isDisabled}
        >
          <Icon size={14} />
        </button>
      );
    })}
  </div>
);

export default SearchViewSelector;
