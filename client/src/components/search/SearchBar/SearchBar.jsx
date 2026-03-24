import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Search } from 'lucide-react';
import styles from './SearchBar.module.css';

/**
 * Global search bar component placed in the Navbar.
 * - Navigates to /search on submit.
 * - Pre-fills from URL q param when already on the search page.
 * @returns {JSX.Element}
 */
const SearchBar = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [value, setValue] = useState(searchParams.get('q') || '');

  // Sync input if URL q param changes externally
  useEffect(() => {
    setValue(searchParams.get('q') || '');
  }, [searchParams]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const section = searchParams.get('section') || 'users';
    navigate(
      `/search?section=${section}&q=${encodeURIComponent(value.trim())}`
    );
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form} role="search">
      <div className={styles.inputWrapper}>
        <Search size={16} className={styles.icon} />
        <input
          type="search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search..."
          className={styles.input}
          aria-label="Search"
        />
      </div>
    </form>
  );
};

export default SearchBar;
