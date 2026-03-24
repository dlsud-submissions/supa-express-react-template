import { sectionConfig, sectionOrder } from '../../../config/searchConfig';
import styles from './SearchSidebar.module.css';

/**
 * Sidebar for selecting the active search section.
 * - One tab per section defined in searchConfig.
 * @param {Object} props
 * @param {string} props.activeSection - Currently active section key.
 * @param {function} props.onSectionChange - Called with new section key on tab click.
 * @returns {JSX.Element}
 */
const SearchSidebar = ({ activeSection, onSectionChange }) => (
  <aside className={styles.sidebar}>
    <p className={styles.label}>Browse</p>
    <nav className={styles.nav}>
      {sectionOrder.map((key) => (
        <button
          key={key}
          className={`${styles.tab} ${activeSection === key ? styles.active : ''}`}
          onClick={() => onSectionChange(key)}
          aria-current={activeSection === key ? 'page' : undefined}
        >
          {sectionConfig[key].label}
        </button>
      ))}
    </nav>
  </aside>
);

export default SearchSidebar;
