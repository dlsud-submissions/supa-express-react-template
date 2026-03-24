import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import { defineConfig, globalIgnores } from 'eslint/config';

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
      // Allow unused vars if they follow specific naming (e.g., StyledComponents or ENV_VARS)
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
    },
  },
]);
