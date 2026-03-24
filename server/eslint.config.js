import js from '@eslint/js';
import globals from 'globals';
import { defineConfig } from 'eslint/config';

/**
 * ESLint configuration for the Node.js backend.
 * - Sets execution environment to Node.js (ECMA 2022).
 * - Includes Vitest/Jest globals for server-side testing.
 * - Configures rules for server-side logging and variable patterns.
 * @returns {Array} Flat configuration array for ESLint.
 */
export default defineConfig([
  {
    // Define directories to be ignored by the linter
    ignores: ['node_modules', 'dist', 'coverage'],
  },
  {
    // Target all JavaScript files in the server directory
    files: ['**/*.js'],

    // Configure the language and environment settings
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',

      // Merge Node.js and Jest/Vitest globals for context awareness
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },

    // Define server-side code quality rules
    rules: {
      // Inherit standard recommended JavaScript rules
      ...js.configs.recommended.rules,

      // Permit unused variables if they are uppercase (Env vars or Constants)
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],

      // Warn on console usage to encourage proper logging in production
      'no-console': 'warn',
    },
  },
]);
