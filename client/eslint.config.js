import js from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';

/**
 * ESLint configuration for the React client.
 * - Configures browser-based globals and ECMA 2020.
 * - Integrates React Hooks and Refresh plugins for Vite.
 * - Sets custom rules for unused variables and JSX support.
 * @returns {Array} Flat configuration array for ESLint.
 */
export default defineConfig([
  // Ignore build artifacts
  globalIgnores(['dist']),

  {
    // Define target files for linting
    files: ['**/*.{js,jsx}'],

    // Extend base configurations for JS, Hooks, and Vite-Refresh
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],

    // Set up the execution environment
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,

      // Configure JS parsing for modules and JSX
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },

    // Define project-specific overrides
    rules: {
      // Allow unused vars if they follow specific naming conventions:
      // - Uppercase names (e.g. StyledComponents or ENV_VARS)
      // - Underscore-prefixed caught errors (e.g. catch (_err))
      'no-unused-vars': [
        'error',
        {
          varsIgnorePattern: '^[A-Z_]',
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
        },
      ],

      // Provider files intentionally export both a component and its matching
      // hook from the same module.
      'react-refresh/only-export-components': [
        'warn',
        {
          allowConstantExport: true,
          allowExportNames: ['useAuth', 'useTheme', 'useToast'],
        },
      ],

      // SearchBar syncs local input state from URL params inside a useEffect.
      // This is the correct pattern for controlled inputs driven by external
      // state (the URL) — setting state directly in the effect body is
      // intentional here, not a cascading render bug.
      'react-hooks/set-state-in-effect': 'off',
    },
  },
  {
    files: ['src/modules/utils/testing/**/*.{js,jsx}'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
]);
