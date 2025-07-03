const { FlatCompat } = require('@eslint/eslintrc');
const compat = new FlatCompat({
  baseDirectory: __dirname,
});

module.exports = [
  ...compat.extends('next/core-web-vitals', 'prettier'),
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
    },
    languageOptions: {
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module'
      }
    }
  }
];