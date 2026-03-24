import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

/**
 * Provider for managing application-wide color themes.
 * - Synchronizes state with localStorage.
 * - Injects 'data-theme' attribute into the <html> element.
 */
export const ThemeProvider = ({ children }) => {
  // Initialize from storage or default to light
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  // Apply theme to DOM and persist on change
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};
