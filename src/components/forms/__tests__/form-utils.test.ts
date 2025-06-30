/**
 * Form Utils Test Suite
 *
 * This is the main test entry point that imports all form utility tests.
 * Tests are organized into separate files for better maintainability:
 *
 * - validation-rules.test.ts: Tests for all validation rule functions
 * - dnd-validators.test.ts: Tests for D&D-specific validator configurations
 * - form-validation.test.ts: Tests for form validation logic and utilities
 * - test-utils.ts: Shared test utilities and helpers
 */

// Import all test suites to ensure they run
import './validation-rules.test';
import './dnd-validators.test';
import './form-validation.test';

// Re-export for any external test imports
export * from './test-utils';
