const { FlatCompat } = require('@eslint/eslintrc');

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

/** @type {import('eslint').Linter.Config[]} */
module.exports = [
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
  }
];