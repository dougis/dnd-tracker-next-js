/* cspell:disable-line globals readonly jsx eslint browserslist typescript nextjs */
import { FlatCompat } from '@eslint/eslintrc';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

/** @type {import('eslint').Linter.Config[]} */
export default [
  // Global ignores
  {
    ignores: [
      '.next/**/*',
      'node_modules/**/*',
      'dist/**/*',
      'build/**/*',
      'coverage/**/*',
      'out/**/*',
      '*.config.js',
      'plato_report/**/*'
    ]
  },
  // Next.js configuration - includes the plugin automatically
  ...compat.extends('next/core-web-vitals'),
  // Prettier configuration
  ...compat.extends('prettier'),
  {
    languageOptions: {
      globals: {
        // Node.js globals
        require: 'readonly',
        module: 'readonly',
        process: 'readonly',
        global: 'readonly',
        console: 'readonly',
        // Browser globals
        window: 'readonly',
        document: 'readonly',
        fetch: 'readonly',
        FormData: 'readonly',
        URL: 'readonly',
        Event: 'readonly',
        Response: 'readonly'
      }
    },
    rules: {
      'prefer-const': 'error',
      'no-var': 'error',
      'no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }
      ],
      'no-multiple-empty-lines': 'error',
      'padding-line-between-statements': 'warn',
      'lines-between-class-members': 'error',
      'lines-around-comment': 'warn',
      'newline-before-return': 'off',
      'newline-after-var': 'off',
      'newline-per-chained-call': 'off',
      'no-trailing-spaces': 'error'
    }
  },
  // Test files configuration
  {
    files: ['**/__tests__/**/*.{js,jsx,ts,tsx}', '**/*.{test,spec}.{js,jsx,ts,tsx}'],
    languageOptions: {
      globals: {
        // Jest globals
        describe: 'readonly',
        test: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        jest: 'readonly',
        // Node.js globals for test files
        require: 'readonly',
        module: 'readonly',
        process: 'readonly',
        global: 'readonly',
        console: 'readonly'
      }
    }
  },
  // Mock files configuration
  {
    files: ['**/__mocks__/**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      globals: {
        // Jest globals for mocks
        jest: 'readonly',
        // Node.js globals for mocks
        require: 'readonly',
        module: 'readonly',
        global: 'readonly'
      }
    }
  }
];